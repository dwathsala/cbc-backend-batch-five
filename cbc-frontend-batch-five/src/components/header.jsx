import UserData from "./userData";

export default function Header(){
    console.log("Header component loading....")
    return(
        <div className="bg-[#FFFF00]">
            <h1 className="font-bold text-[100px] text-blue-700">Crystal Beauty Clear</h1>  
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis libero voluptatibus velit amet nisi nihil provident nulla, nostrum praesentium, dolores iure ducimus odit esse ex veniam aliquid magnam placeat iste.</p>
            <UserData></UserData>
        </div>
    )
}
//function name should equal to tag that we will create
//to change the text size in manually we use [] like in "text-[100px]"