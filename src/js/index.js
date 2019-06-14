import Search from "./models/Search";
import * as searchView from "./views/searchView"
import * as recipeView from "./views/recipeView"
import * as listView from "./views/listView"
import * as likesView from "./views/likesView"
import Recipe from "./models/recipe"
import List from "./models/list"
import {elements, renderLoader, clearLoader} from "./views/base"
import Likes from "./models/likes";

const state = {}


//Search Controller
const controlSearch = async () =>{
    const query = searchView.getInput();

    if(query){
        state.search = new Search(query);

        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            await state.search.getResults();
            clearLoader();
            searchView.renderResults(state.search.result);   
        } catch (error) {
            alert("Search Error");
            console.log(error)
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener("submit", e=>{
    e.preventDefault();
    controlSearch();
})

elements.searchResPages.addEventListener("click", e=>{
    const btn = e.target.closest(".btn-inline");
    if(btn){
        const gotoPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, gotoPage);
    }
});

//Recipe Controller
const controlRecipe = async () =>{
    const id = window.location.hash.replace("#", "");
    
    if(id){
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        if (state.search) searchView.highlightSelected(id);

        state.recipe = new Recipe(id);
        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            state.recipe.calcTime();
            state.recipe.calcServings();
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id)); 
        } catch (error) {
            console.log(error);
            alert("Recipe Error")
        }
    }
}

["hashchange", "load"].forEach(event => window.addEventListener(event, controlRecipe));
// window.addEventListener("load", controlRecipe);

//List Controller

const controlList = () =>{
    if (!state.list) state.list = new List();

    state.recipe.ingredients.forEach(el=>{
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item)
    })
}

//Handle delete and updat list items
elements.shopping.addEventListener("click", e=>{
    const id = e.target.closest(".shopping__item").dataset.itemid;

    if(e.target.matches(".shopping__delete, .shopping__delete *")){
        state.list.deleteItem(id);
        listView.deleteItem(id);
    }else if(e.target.matches(".shopping__count-value")){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val)
    }
})

//Likes Controller



const controlLike = () => {
    if(!state.likes) state.likes = new Likes();

    const currentId = state.recipe.id;

    if(!state.likes.isLiked(currentId)){
        const newLike = state.likes.addLike(currentId, state.recipe.title, state.recipe.author, state.recipe.img)
        likesView.toggleLikedBtn(true);
        likesView.renderLike(newLike);
    }else{
        state.likes.deleteLike(currentId);
        likesView.toggleLikedBtn(false);
        likesView.deleteLike(currentId);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes())
}

window.addEventListener("load", ()=>{
    state.likes = new Likes();
    state.likes.readStorage();

    likesView.toggleLikeMenu(state.likes.getNumLikes())

    state.likes.likes.forEach(like => likesView.renderLike(like));
})

elements.recipe.addEventListener("click", e=>{
    if(e.target.matches(".btn-decrease, .btn-decrease *")){
        if(state.recipe.servings >1){
            state.recipe.updateServings("dec");
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if(e.target.matches(".btn-increase, .btn-increase *")){
        state.recipe.updateServings("inc");
        recipeView.updateServingsIngredients(state.recipe);
    }else if(e.target.matches(".recipe__btn--add, .recipe__btn--add *")){
        controlList();
    }else if(e.target.matches(".recipe__love, .recipe__love *")){
        controlLike();
    }

    //console.log(state.recipe)
})