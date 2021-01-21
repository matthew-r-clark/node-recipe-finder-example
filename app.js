const fetch = require('node-fetch');
const util = require('util');

class App {
  #recipes = [];
  #query;
  #ingredients;
  #ingredientQuantity;

  constructor(loggingEnabled = true) {
    this.loggingEnabled = loggingEnabled;
  }

  recipes() {
    return this.#recipes;
  }

  async getRecipes() {
    let chunkStart = 1;
    let chunkSize = 5;
    let keepChecking = true;

    while (keepChecking) {
      let results = [];

      // create array of promises for requests
      for (let page = chunkStart; page < chunkStart + chunkSize; page += 1) {
        results.push(this.requestRecipes(page));
      }

      // await promises and action
      for (let i = 0; i < results.length; i += 1) {
        let page = i + chunkStart;
        let result = await results[i];

        if (result === null) {
          this.log(`Request for page ${page} received an error, skipping.`);
        } else if (result.length > 0) {
          this.log(`Added recipes from page ${page} of search results.`);
        }

        results[i] = result;
      }

      results = results.filter(r => r !== null);

      // if any results are empty array, set keepChecking to false

      if (results.some(r => r.length === 0)) {
        keepChecking = false;
      } else { // else increase chunkStart by 5
        chunkStart += chunkSize;
      }

      this.#recipes = this.#recipes.concat(results.flat());
    }
  }

  // PAIRED WITH getRecipes above
  async requestRecipes(page) {
    try {
      let url = `http://www.recipepuppy.com/api/?i=${this.#ingredients}&q=${this.#query}&p=${page}`;
      let results = await fetch(url).then(res => res.json()).then(data => data.results);
      return results;

    } catch (error) {
      return null;
    }
  }

  // ORIGINAL
  // async getRecipes(page = 1) {
  //   try {
  //     let url = `http://www.recipepuppy.com/api/?i=${this.#ingredients}&q=${this.#query}&p=${page}`;
  //     let data = await fetch(url).then(res => res.json());
  //     let results = data.results;

  //     if (results.length > 0) {
  //       this.addResultsToRecipeList(results);
  //       this.log(`Added recipes from page ${page} of search results.`);
  //       await this.getRecipes(page + 1);
  //     }
  //   } catch (error) {
  //     this.log(`Request for page ${page} received an error, skipping.`);
  //     await this.getRecipes(page + 1);
  //   }
  // }

  addResultsToRecipeList(results) {
    this.#recipes = this.#recipes.concat(results);
  }

  async formatRecipeList() {
    this.log('Total recipes found:', this.#recipes.length);
    await this.removeBrokenLinks();
    this.#recipes.forEach(this.addIngredientCount.bind(this));
    this.#recipes.sort(this.sortByIngredientCountDescending);
    this.log('Total recipes remaining:', this.#recipes.length);
  }

  sortByIngredientCountDescending(a, b) {
    a = a.ingredientCount;
    b = b.ingredientCount;

    if (a > b) {
      return -1;
    } else if (a < b) {
      return 1;
    } else {
      return 0;
    }
  }

  addIngredientCount(recipe) {
    recipe.ingredientCount = this.getIncredientCount(recipe);
  }

  getIncredientCount(recipe) {
    return recipe.ingredients.split(', ').length;
  }

  async removeBrokenLinks() {
    let recipesWithWorkingLinks = [];
    this.log('\nChecking for broken links...');

    let linkPromises = this.#recipes.map(async (recipe) => {
      let updatedRecipe = await this.isBrokenLink(recipe.href).then(isBroken => {
        recipe.isBroken = isBroken;
        return recipe;
      });
      return updatedRecipe;
    });

    // (in order of fastest response)
    this.log('Displaying link checking status as responses are recieved.');
    let length = linkPromises.length;
    for (let i = 0; i < length; i += 1) {
      let current = await Promise.race(linkPromises);
      let index = indexOfPromise(linkPromises, current);
      linkPromises.splice(index, 1);

      let url = current.href
      if (current.isBroken) {
        this.log('✗', url);
      } else {
        this.log(' ', url);
        recipesWithWorkingLinks.push(current);
      }
    }

    // (in original order)
    // this.log('Checking links in original order');
    // for (let i = 0; i < linkPromises.length; i += 1) {
    //   let current = await linkPromises[i];

    //   let url = current.href
    //   if (current.isBroken) {
    //     this.log('✗', url);
    //   } else {
    //     this.log(' ', url);
    //     recipesWithWorkingLinks.push(current);
    //   }
    // }

    this.log('All broken links removed!');
    this.#recipes = recipesWithWorkingLinks;
  }

  async isBrokenLink(url) {
    let options = { method: 'HEAD' }
    try {
      const status = await fetch(url, options).then(res => res.status);
      return status >= 400;
    } catch (error) {
      return error.code !== 'ECONNRESET';
    }
  }

  log() {
    this.loggingEnabled && console.log(...arguments);
  }

  selectRecipe() {
    switch (this.#ingredientQuantity) {
      case 'max':
        return this.#recipes[0];
      case 'min':
        return this.#recipes[this.#recipes.length - 1];
    }
  }

  displayRecipe() {
    let recipe = this.selectRecipe();
    if (recipe) {

      this.log(`\n\nYour ${this.#query} recipe${getIngredientString(this.#ingredients)} with the ${this.#ingredientQuantity === 'max' ? 'greatest' : 'least'} number of ingredients:`);
      console.table({
        Name: recipe.title,
        URL: recipe.href,
        Ingredients: recipe.ingredientCount,
      });
    } else {
      this.log(`Sorry! No ${this.#query} recipes found using ${this.#ingredients}.`);
    }
  }

  processSearchOptions(search) {
    search.query = (search.query === undefined) ? 'lasagna' : search.query;
    search.ingredients = (search.ingredients === undefined) ? 'pesto' : search.ingredients;
    search.ingredientQuantity = (search.ingredientQuantity === undefined) ? 'max' : search.ingredientQuantity;

    if (Object.values(search).some(v => typeof v !== 'string')) {
      throw new TypeError('Search properties must be of type string.');
    } else if (search.ingredientQuantity !== 'max' && search.ingredientQuantity !== 'min') {
      throw new Error('"ingredientQuantity" search property must be either "max" or "min".');
    }

    this.#query = search.query;
    this.#ingredients = search.ingredients;
    this.#ingredientQuantity = search.ingredientQuantity;
  }

  async search(searchOptions = {}) {
    try {
      this.processSearchOptions(searchOptions);
      await this.getRecipes();
      await this.formatRecipeList();
      this.displayRecipe();
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = App;

function getIngredientString(list) {
  if (!list || list.length === 0) {
    return '';
  }
  let array = list.split(',').map(e => e.trim());
  return ` (using ${joinPlus(array, 'or')})`;
}

function joinPlus(array, plus) {
  if (array.length === 1) {
    return array[0];
  } else if (array.length === 2) {
    return `${array[0]} ${plus} ${array[1]}`;
  } else if (array.length > 2) {
    return array.slice(0, -1).join(', ') + `, ${plus} ${array[array.length - 1]}`;
  }
}

function indexOfPromise(array, target) {
  for (let i = 0; i < array.length; i +=1 ) {
    let current = array[i];
    if (promiseIncludes(current, target)) {
      return i;
    }
  }
  return -1;
}

function promiseIncludes(promise, value) {
  promise = inspect(promise).replace(/ /g, '');
  value = inspect(value).replace(/ /g, '');

  return promise.includes(value);
}

function inspect(object) {
  return util.inspect(object);
}