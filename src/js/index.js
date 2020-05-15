import Search from './models/Search';
import {elements, renderLoader, clearLoader} from './views/base';
import * as searchView from './views/searchView';
import Recipe from './models/recipe';
import * as recipeView from './views/recipeView';
import List from './models/list';
import * as listView from './views/listView';
import Likes from './models/Likes';
import * as likesView from './views/likesView';


/*  Global state of the app
  - Search object
  - Currrent recipe object
  - liked recipes
  */
const state = {};
window.state = state;


//Search controller
const controlSearch = async () =>{
   //  1 . get the query
   const query = searchView.getInput();
   console.log(query);


   if(query)
   // 2) New search object and add to state
   state.search  = new Search(query);

   // 3) Prepare UI for results
   searchView.clearInput();

   searchView.clearResults();
   renderLoader(elements.searchRes);


   // 4) Search for recipes
      await state.search.getResults();

   // 5) Render results on UI
     clearLoader();
     searchView.renderResults(state.search.result);

};

elements.searchForm.addEventListener('submit', e =>{
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e =>{
  const btn = e.target.closest('.btn-inline'); //imp
  if(btn){
    const goToPage = parseInt(btn.dataset.goto,10);
    console.log(goToPage);
    searchView.clearResults();
    searchView.renderResults(state.search.result,goToPage);

  }
});



//Recipe controller
const controlRecipe = async () => {
  // Get ID from URL
  const id = window.location.hash.replace('#','');
  console.log(id);
if(id){
  // Prepare UI for changes
  recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //Highlight selected search items
    if(state.search) searchView.highlightSelected(id);
  // Create new recipe object
   state.recipe = new Recipe(id);

try{
  // Get recipe data and parseIngredients
    await state.recipe.getRecipe();
    state.recipe.parseIngredients()


  // Calculate servings and time
  state.recipe.calcTime();
  state.recipe.calcServings();

  // Render Recipe
  clearLoader();
   recipeView.renderRecipe(
   state.recipe,
   state.likes.isLiked(id)
  );

}
  catch(err){
    console.log(err);
    alert('error processing recipe :(');
  }

}

};

window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);
// List controller

const controlList = () => {
  // Create a new list if there is none stylesheet
  if(!state.list)  state.list = new List();

  // Add each ingredient to the list
   state.recipe.ingredients.forEach((el) => {
      const item = state.list.addItem(el.count, el.unit, el.ingredient);
      listView.renderItem(item);
   });
};

// handle delete and update list item events

elements.shopping.addEventListener('click', e => {   // event delegation
  const id = e.target.closest('.shopping__item').dataset.itemid;

// handle the delete buttons
if(e.target.matches('.shopping__delete, .shopping__delete *')){
  // Delete from state and user interface
   state.list.deleteItem(id);

   listView.deleteItem(id);
  // handle the count update
}  else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat( e.target.value, 10);
    state.list.updateCount(id, val);
}
});
//testing
state.likes = new Likes;
likesView.toggleLikeMenu(state.likes.getNumLikes());

// LIKE CONTROLLER

const controlLike = () => {
  if (!state.likes) state.likes = new Likes ;
  const currentID = state.recipe.id;

  // User has NOT yet liked current recipe
  if(!state.likes.isLiked(currentID)){
    // Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // Toggle the like button
       likesView.toggleLikeBtn(true);
    // Add like to UI list
    likesView.renderLike(newLike);



    // User has  liked current recipe
  } else {

    // remove like to the state
     state.likes.deleteLike(currentID);
    // Toggle the like button
    likesView.toggleLikeBtn(false);

    // remove like to UI list
    likesView.deleteLike(currentID);



  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore like recipes on page loads
window.addEventListener('load', () => {
  state.likes = new Likes;

  // restore likes
  state.likes.readStorage();

  // toggle like menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  //render exciting lkes
  state.likes.likes.forEach((like) => likesView.renderLike(like));

  

});




// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);

        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
     // ADd ingredients to list
      controlList();
    }
    else if (e.target.matches('.recipe__love, .recipe__love *')) {
      // Like CONTROLLER
       controlLike();

   }
});
 window.l = new List();
