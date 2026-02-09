// const fs=require("fs");
// const contents=fs.readFileSync("a.txt","utf-8");//sync
// console.log(contents);


// function add(a,b){
//     return a+b;
// }
// function diff(a,b){
//     return a-b;
// } 
// function arithematic(a,b,fn){

//     return fn(a,b)
// }

// const ans1=arithematic(5,6,add);
// const ans2=arithematic(5,6,diff);
// console.log(ans1);
// console.log(ans2);

const fs=require("fs")

function filereadcallback(err,contents){
    if(err){
        console.log("error reading the file");
    }
    else{
        console.log(contents);
    }
}

fs.readFile("a.txt","utf-8",filereadcallback);

let s=0;
for(let i=0;i<1000;i++){
    s+=i;
}
console.log(s);