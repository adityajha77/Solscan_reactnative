// //promise i need the function after 5 seconds

// function callback(){
//     console.log("hi there")
// }

// setTimeout(callback,5000);

// let ctr=0;
// for(let i=0;i<100;i++){
//     ctr+=1;
// }
// console.log(ctr);


//jab tak thread nai free ho ga tab tak nai print hoga kuch normally;

//blackbox for now
// function setTimeoutPromisified(ms){
//      return new Promise(resolve => setTimeout(resolve, ms));
// }


// function callback(){
//     console.log("hii there")
// }
// setTimeoutPromisified(3000).then(callback);//morden js way to write the code

// setTimeout(callback,3000);

//initally
const fs=require("fs")


//question ask
function fsReadFilePromisified(filePath, encoding) {
    let p= new Promise((resolve, reject) => {
        fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data);
            }
        })
    })
    return p;
}

function callback(err,data){
    if(err){
        console.log("error while reading the file")
    }
    else{
        console.log(data);
    }
}
function callbackErr(){
    console.log("error while reading the file")
}
fsReadFilePromisified("./a.txt","utf-8").then(callback).catch(callbackErr);