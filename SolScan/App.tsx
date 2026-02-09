import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
  Keyboard,
} from "react-native";

// --- Types ---
interface Token {
  mint: string;
  amount: number;
}

interface Transaction {
  sig: string;
  time: number;
  ok: boolean;
}

// --- API Helpers ---
const RPC = "https://api.mainnet-beta.solana.com";

const rpc = async (method: string, params: any[]) => {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
};

const getBalance = async (addr: string) => {
  const result = await rpc("getBalance", [addr]);
  return result.value / 1_000_000_000;
};

const getTokens = async (addr: string): Promise<Token[]> => {
  const result = await rpc("getTokenAccountsByOwner", [
    addr,
    { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
    { encoding: "jsonParsed" },
  ]);
  return (result.value || [])
    .map((a: any) => ({
      mint: a.account.data.parsed.info.mint,
      amount: a.account.data.parsed.info.tokenAmount.uiAmount,
    }))
    .filter((t: Token) => t.amount > 0)
    .slice(0, 10);
};

const getTxns = async (addr: string): Promise<Transaction[]> => {
  const sigs = await rpc("getSignaturesForAddress", [addr, { limit: 5 }]);
  return sigs.map((s: any) => ({
    sig: s.signature,
    time: s.blockTime,
    ok: !s.err,
  }));
};

// --- Utils ---
const short = (s: string, n = 4) => (s.length > n * 2 ? `${s.slice(0, n)}...${s.slice(-n)}` : s);

const timeAgo = (ts: number) => {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// --- Main Component ---
export default function App() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [searchedAddr, setSearchedAddr] = useState("");

  const search = async () => {
    const addr = address.trim();
    if (!addr) return Alert.alert("Input Error", "Please enter a wallet address");

    Keyboard.dismiss();
    setLoading(true);
    setBalance(null); // Reset UI while loading

    try {
      const [bal, tok, tx] = await Promise.all([
        getBalance(addr),
        getTokens(addr),
        getTxns(addr),
      ]);
      setBalance(bal);
      setTokens(tok);
      setTxns(tx);
      setSearchedAddr(addr);
    } catch (e: any) {
      Alert.alert("Fetch Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="light" />
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        
        {/* Header */}
        <Text style={s.title}>Solana Wallet</Text>
        <Text style={s.subtitle}>Explorer & Tracker</Text>

        {/* Search Section */}
        <View style={s.inputContainer}>
          <TextInput
            style={s.input}
            placeholder="Paste Solana address..."
            placeholderTextColor="#6B7280"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity 
          style={[s.btn, loading && s.btnDisabled]} 
          onPress={search} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0D0D12" />
          ) : (
            <Text style={s.btnText}>Search Wallet</Text>
          )}
        </TouchableOpacity>

        {/* Results Section */}
        {balance !== null && (
          <View style={s.resultContainer}>
            
            {/* Balance Card */}
            <View style={s.card}>
              <Text style={s.label}>Total Balance</Text>
              <View style={s.balanceRow}>
                <Text style={s.balance}>{balance.toFixed(4)}</Text>
                <Text style={s.sol}>SOL</Text>
              </View>
              <Text style={s.addr}>{short(searchedAddr, 8)}</Text>
            </View>

            {/* Tokens List */}
            {tokens.length > 0 && (
              <View>
                <Text style={s.section}>Tokens ({tokens.length})</Text>
                {tokens.map((t) => (
                  <View key={t.mint} style={s.row}>
                    <View>
                        <Text style={s.mintLabel}>Mint Address</Text>
                        <Text style={s.mint}>{short(t.mint, 6)}</Text>
                    </View>
                    <Text style={s.amount}>{t.amount.toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Transactions List */}
            {txns.length > 0 && (
              <View>
                <Text style={s.section}>Recent Activity</Text>
                {txns.map((t) => (
                  <TouchableOpacity
                    key={t.sig}
                    style={s.row}
                    onPress={() => Linking.openURL(`https://solscan.io/tx/${t.sig}`)}
                  >
                    <View>
                      <Text style={[s.mint, { color: t.ok ? "#14F195" : "#FF5252" }]}>
                        {t.ok ? "Success" : "Failed"}
                      </Text>
                      <Text style={s.time}>{timeAgo(t.time)}</Text>
                    </View>
                    <Text style={s.linkText}>View ↗</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0D0D12",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 4,
    marginBottom: 32,
    fontWeight: "400",
  },
  inputContainer: {
    backgroundColor: "#16161D",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 16,
    fontWeight: "400",
  },
  btn: {
    backgroundColor: "#14F195",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#14F195",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: "#0D0D12",
    fontWeight: "700",
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 32,
  },
  card: {
    backgroundColor: "#16161D",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A35",
    marginBottom: 10,
  },
  label: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
    marginBottom: 16,
  },
  balance: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: -1.5,
  },
  sol: {
    color: "#14F195",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  addr: {
    color: "#9945FF",
    fontSize: 14,
    fontFamily: "monospace",
    backgroundColor: "rgba(153, 69, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
  },
  section: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 32,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#16161D",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  mintLabel: {
    color: "#6B7280",
    fontSize: 10,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  mint: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  amount: {
    color: "#14F195",
    fontSize: 16,
    fontWeight: "600",
  },
  time: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
  },
  linkText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500",
  },
});