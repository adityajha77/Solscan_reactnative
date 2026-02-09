//classes
//when ever the object created from the clas then constructor called
//
class Rectangle{
    constructor(width,height,color){
        this.width=width;
        this.height=height;
        this.color=color;
    }
    area(){
        const area =  this.width*this.height;
        return area;
    }
    print(){
        console.log("red");
    }
    static whoami(){
        return "i am rectangle";
    }
}
let r1=new Rectangle(10,10,"red");
//const area=r1.area();
console.log(r1.area());

//jo 10 10 hai wo this ke saath attach ho jaiga ki r1 ke pass 10 and 10 hai height and width

const date=new Date();
console.log(date.getFullYear())
console.log(date.getDay())
//console.log(r1.whoami()); //error TypeError: r1.whoami is not a function
console.log(Rectangle.whoami());

//what are static
//direct class pe attach hota na ki object pe uses singolton!!

//inheritance
//we use extends not repeating the code again and again define in parents and use where ever you want
//we use super to say that mera jo parent class hai auska colore property ko call kar dho

class Shape{
    
}

class Circle{

}