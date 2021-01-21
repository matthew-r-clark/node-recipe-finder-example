const fetch = jest.fn((url, options) => {
  let payload = {};

  if (options && options.method === 'HEAD') {
    switch (url) {
      case 'http://not-found.com':
        payload.status = 404;
        break;
      case 'http://server-error.com':
        payload.status = 500;
        break;
      case 'http://valid-site.com':
        payload.status = 200;
        break;
      case 'http://no-response.com':
        return Promise.reject({code: 'ENOTFOUND'});
      case 'http://socket-error.com':
        return Promise.reject({code: 'ECONNRESET'});
    }
  } else {
    let page = parsePageNumberFromUrl(url);
    let recipes = allRecipes[page] || emptyPage;

    if (recipes === 'server error') {
      payload.status = 500;
    } else {
      payload.json = function () {
        return recipes;
      }
    }
  }

  return Promise.resolve(payload);
});

module.exports = fetch;


function parsePageNumberFromUrl(url) {
  let queryString = url.split('?')[1];
  let queryParams = queryString.split('&');

  let queries = {};
  queryParams.forEach(q => {
    let pair = q.split('=');
    queries[pair[0]] = pair[1];
  });

  return queries['p'];
}

const emptyPage = { "title": "Recipe Puppy", "version": 0.1, "href": "http:\/\/www.recipepuppy.com\/", "results": [] };

const allRecipes = {
  1: {
    title: 'Recipe Puppy',
    version: 0.1,
    href: 'http://www.recipepuppy.com/',
    results: [
      {
        title: 'Pesto Polenta Lasagna',
        href: 'http://valid-site.com',
        ingredients: 'mozzarella cheese, pesto, pine nuts',
        thumbnail: 'http://img.recipepuppy.com/11092.jpg'
      },
      {
        title: 'Asparagus Lasagna Recipe',
        href: 'http://not-found.com',
        ingredients: 'pesto, garlic, flour, fontina cheese, lasagna noodle, asparagus, parmesan cheese, olive oil, butter, black pepper, salt',
        thumbnail: 'http://img.recipepuppy.com/166981.jpg'
      },
      {
        title: 'Easy Lasagna',
        href: 'http://valid-site.com',
        ingredients: 'ground beef, marinara sauce, lasagna noodle, ricotta cheese, eggs, pesto, red pepper, mozzarella cheese',
        thumbnail: 'http://img.recipepuppy.com/597344.jpg'
      }
    ]
  },

  2: {
    title: 'Recipe Puppy',
    version: 0.1,
    href: 'http://www.recipepuppy.com/',
    results: [
      {
        title: '\nAsparagus Artichoke Lasagna Recipe\n\n',
        href: 'http://valid-site.com',
        ingredients: 'lasagna noodle, asparagus, pesto, artichoke, mozzarella cheese, ricotta cheese, cottage cheese, cherry pepper, salt, italian seasoning',
        thumbnail: ''
      },
      {
        title: 'Vegetable Lasagna Recipe',
        href: 'http://valid-site.com',
        ingredients: 'pasta sauce, carrot, ricotta cheese, pesto, nonstick cooking spray, mushroom, olive oil, mozzarella cheese, red pepper, red onions, zucchini',
        thumbnail: ''
      },
      {
        title: 'Lazy Lasagna',
        href: 'http://no-response.com',
        ingredients: 'green onion, eggs, black pepper, ziti pasta, mozzarella cheese, ricotta cheese, tomato sauce, butter, salt, pesto, garlic salt',
        thumbnail: ''
      }
    ]
  },

  3: 'server error',

  4: {
    title: 'Recipe Puppy',
    version: 0.1,
    href: 'http://www.recipepuppy.com/',
    results: [
      {
        title: '"Beans & Barley" Pesto Lasagna',
        href: 'http://no-response.com',
        ingredients: 'basil, pesto, lasagna noodle, mozzarella cheese, pine nuts',
        thumbnail: ''
      },
      {
        title: 'Asparagus-Pesto Lasagna',
        href: 'http://valid-site.com',
        ingredients: 'flour, asparagus, black pepper, lasagna noodle, milk, olive oil, parmesan cheese, pesto, salt',
        thumbnail: ''
      },
      {
        title: 'Vegetarian Four Cheese Lasagna',
        href: 'http://valid-site.com',
        ingredients: 'pumpkin puree, eggplant, eggs, feta cheese, mozzarella cheese, parmesan cheese, pasta, pesto, ricotta cheese, salt, tomato',
        thumbnail: 'http://img.recipepuppy.com/9656.jpg'
      }
    ]
  },

  5: {
    title: 'Recipe Puppy',
    version: 0.1,
    href: 'http://www.recipepuppy.com/',
    results: [
      {
        title: 'Tomato Pesto Lasagna',
        href: 'http://not-found.com',
        ingredients: 'water, sausage, lasagna noodle, mozzarella cheese, ricotta cheese, pesto',
        thumbnail: ''
      },
      {
        title: 'Pesto Lasagna Rolls',
        href: 'http://valid-site.com',
        ingredients: 'lasagna noodle, pasta sauce, garlic, ricotta cheese, spinach, pesto, eggs, parmesan cheese, salt, black pepper, mozzarella cheese',
        thumbnail: 'http://no-response.com'
      },
      {
        title: '\nBaked Lasagna With Asparagus And Pesto Recipe\n\n',
        href: 'http://valid-site.com',
        ingredients: 'asparagus, pasta, salsa, pesto, pecorino, bread crumbs',
        thumbnail: ''
      }
    ]
  },
};