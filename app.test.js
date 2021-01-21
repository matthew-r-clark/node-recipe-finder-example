const App = require('./app');


test('requestRecipes works', async () => {
  let app = new App(false);
  await app.requestRecipes();

  expect(Array.isArray(app.recipes())).toEqual(true);
  expect(app.recipes()[0]).toEqual(expect.objectContaining({
    title: expect.any(String),
    href: expect.any(String),
    ingredients: expect.any(String),
    thumbnail: expect.any(String),
  }));
  expect(app.recipes().length).toBe(12);
});

test('addResultsToRecipeList works', async () => {
  let app = new App(false);
  let resultsToAdd = [
    {
      title: 'Spinach-Ravioli Lasagna',
      href: 'http://find.myrecipes.com/recipes/recipefinder.dyn?action=displayRecipe&recipe_id=1823305',
      ingredients: 'spinach, pesto, alfredo sauce, vegetable broth, cheese, cheese, basil',
      thumbnail: 'http://img.recipepuppy.com/549656.jpg'
    },
    {
      title: 'Pesto Lasagna',
      href: 'http://allrecipes.com/Recipe/Pesto-Lasagna/Detail.aspx',
      ingredients: 'pasta sauce, pesto, black pepper, eggs, mozzarella cheese, nutmeg, olive oil, onions, parmesan cheese, ricotta cheese, salt',
      thumbnail: 'http://img.recipepuppy.com/6924.jpg'
    }
  ];

  await app.requestRecipes();
  let length = app.recipes().length;
  app.addResultsToRecipeList(resultsToAdd);
  expect(app.recipes().length).toBe(length + 2);
});

// formatRecipeList

test('first recipe has most ingredients after formatRecipeList', async () => {
  let app = new App(false);
  await app.requestRecipes();
  await app.formatRecipeList();
  let firstRecipe = app.recipes()[0];
  let list = app.recipes().filter(r => r.ingredientCount >= firstRecipe.ingredientCount);
  expect(list.length === 1 || !list.some(r => r.ingredientCount > firstRecipe.ingredientCount)).toEqual(true);
});

test('sortByIngredientCountDescending works', async () => {
  let app = new App(false);
  await app.requestRecipes();
  app.recipes().forEach(app.addIngredientCount.bind(app));
  let unsortedIngredientCountArray = app.recipes().map(r => r.ingredientCount);
  app.recipes().sort(app.sortByIngredientCountDescending);
  let sortedIngredientCountArray = app.recipes().map(r => r.ingredientCount);

  expect(sortedIngredientCountArray)
    .toEqual(unsortedIngredientCountArray.sort(sortNumericDescending));
});

test('addIngredientCount works', () => {
  let app = new App(false);
  let recipe = {
    title: 'Pesto Lasagna',
    href: 'http://allrecipes.com/Recipe/Pesto-Lasagna/Detail.aspx',
    ingredients: 'pasta sauce, pesto, black pepper, eggs, mozzarella cheese, nutmeg, olive oil, onions, parmesan cheese, ricotta cheese, salt',
    thumbnail: 'http://img.recipepuppy.com/6924.jpg'
  };

  app.addIngredientCount(recipe);
  expect(recipe).toEqual(expect.objectContaining({
    title: expect.any(String),
    href: expect.any(String),
    ingredients: expect.any(String),
    thumbnail: expect.any(String),
    ingredientCount: expect.any(Number),
  }));
});

test('getIngredientCount works', () => {
  let app = new App(false);
  let recipe = {
    title: 'Easy Lasagna',
    href: 'http://valid-site.com',
    ingredients: 'ground beef, marinara sauce, lasagna noodle, ricotta cheese, eggs, pesto, red pepper, mozzarella cheese',
    thumbnail: 'http://img.recipepuppy.com/597344.jpg'
  };

  let count = app.getIncredientCount(recipe);
  expect(count).toBe(8);
});

test('removeBrokenLinks works', async () => {
  let app = new App(false);
  await app.requestRecipes();
  let length = app.recipes().length;
  await app.removeBrokenLinks();
  expect(app.recipes().length).toBe(length - 4);
});

test('isBrokenLink method returns false on working link', async () => {
  let app = new App(false);
  let result = await app.isBrokenLink('http://valid-site.com');
  expect(result).toEqual(false);
});

test('isBrokenLink method returns false on socket hang up error', async () => {
  let app = new App(false);
  let result = await app.isBrokenLink('http://socket-error.com');
  expect(result).toEqual(false);
});

test('isBrokenLink method returns true when site does not exist', async () => {
  let app = new App(false);
  let result = await app.isBrokenLink('http://no-response.com');
  expect(result).toEqual(true);
});

test('isBrokenLink method returns true on http status error', async () => {
  let app = new App(false);
  let notFoundResult = await app.isBrokenLink('http://not-found.com');
  let serverErrorResult = await app.isBrokenLink('http://server-error.com');
  expect(notFoundResult).toEqual(true);
  expect(serverErrorResult).toEqual(true);
});

function sortNumericDescending(a, b) {
  if (a > b) {
    return -1;
  } else if (a < b) {
    return 1;
  } else {
    return 0;
  }
}