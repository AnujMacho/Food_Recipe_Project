import axios from "axios";
import * as config from "../config";

//https://www.food2fork.com/api/search
//c4111679a268a3ccfd5de2767f1ba1aa

export default class Search{
    constructor(query){
        this.query = query;
    }

    async getResults(){
        try {
            const res = await axios(`https://www.food2fork.com/api/search?key=${config.key}&q=${this.query}`);
            console.log(res)
            this.result = res.data.recipes;
            //console.log(this.result)
        } catch (error) {
            alert(error);
        }
    }
}