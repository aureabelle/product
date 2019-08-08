var eventBus = new Vue();

Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: true
    },
    shipping: {
      type: String,
      required: true
    },
    details: {
      type: Array,
      required: true
    }
  },
  template: `
    <div>
      <span class="tab"
            :class="{ activeTab: selectedTab === tab }"
            v-for="(tab, index) in tabs"
            @click="selectedTab = tab"
            :key="index">{{ tab }}</span>


      <div v-show="selectedTab === 'Reviews'">
        <h2>Reviews</h2>
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul>
          <li v-for="review in reviews">
            <p>{{ review.name }}</p>
            <p>Rating: {{ review.rating }}</p>
            <p>{{ review.review }}</p>
          </li>
        </ul>
      </div>

      <product-review v-show="selectedTab === 'Make a Review'"></product-review>

      <p v-show="selectedTab === 'Shipping'">Shipping: {{ shipping }}</p>

      <product-details :details="details" v-show="selectedTab === 'Details'"></product-details>

    </div>
  `,
  data() {
    return {
      tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
      selectedTab: 'Reviews' // set from @click
    }
  }
});

Vue.component('product-review', {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">
      <p v-if="errors.length">
        <b>Please correct the following errors:</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>

      <p>
        <label for="name">Name:</label>
        <input id="name" placeholder="name" v-model="name">
      </p>

      <p>
        <label for="review">Review:</label>
        <textarea id="review" v-model="review"></textarea>
      </p>

      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

      <p>
        <span>Would you recommend this product?</span>
        <input type="radio" value="yes" v-model="recommend" id="recommend-yes">
        <label for="recommend-yes">Yes</label>

        <input type="radio" value="no" v-model="recommend" id="recommend-no">
        <label for="recommend-no">No</label>

      </p>

      <p>
        <input type="submit" value="Submit">
      </p>
    </form>
  `,

  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommend: null,
      errors: []
    }
  },

  methods: {
    onSubmit() {
      if (this.name && this.review && this.rating && this.recommend) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommend: this.recommend
        };

        eventBus.$emit('review-submitted', productReview);

        this.name = null;
        this.review = null;
        this.rating = null;
        this.recommend = null;
      } else {

        if(!this.name) this.errors.push("Name required")
        if(!this.review) this.errors.push("Review required")
        if(!this.rating) this.errors.push("Rating required")
        if(!this.recommend) this.errors.push("Recommend required")

      }
    }
  }
});

Vue.component('product-details', {
  props: {
    details: {
      type: Array,
      required: true
    }
  },

  template: `
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `
});

Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    }
  },

  template: `
    <div class="product">
      <div class="product-image">
        <a :href="link" target="_blank">
          <img :src="image" :alt="altText" />
        </a>
      </div>

      <div class="product-info">
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
        <p v-if="inStock">In Stock</p>
        <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
        <span>{{ sale }}</span>

        <div v-for="(variant, index) in variants"
             :key="variant.variantId"
             class="color-box"
             :style="{ backgroundColor: variant.variantColor }"
             @mouseover="updateProduct(index)">
        </div>

        <ul>
          <li v-for="size in sizes">{{ size }}</li>
        </ul>

        <button v-on:click="addToCart"
                :disabled="!inStock"
                :class="{ disabledButton: !inStock }">Add to Cart</button>
        <button @click="decrementCart">Remove 1 item</button>
      </div>


      <product-tabs :reviews="reviews" :shipping="shipping" :details="details"></product-tabs>

    </div>
  `,

  // Data
  data() {
    return {
      product: 'Socks',
      brand: 'Vue Mastery',
      description: 'A pair of warm, fuzzy socks.',
      selectedVariant: 0,
      altText: 'A pair of socks',
      link: 'http:www.cnn.com',

      inStock: true,
      onSale: true,

      details: ["80% cotton", "20% polyester", "Gender-neutral"],
      variants: [
        {
          variantId: 001,
          variantColor: "green",
          variantImage: './assets/green-socks.png'
        },
        {
          variantId: 002,
          variantColor: "blue",
          variantImage: './assets/blue-socks.png'
        }
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      reviews: []
    }
  },

  // Methods
  methods: {
    addToCart() {
      this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
    },

    updateProduct(index) {
      this.selectedVariant = index
    },

    decrementCart() {
      this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
    }
  },

  // Computed
  computed: {
    title() {
      return this.brand + ' ' + this.product
    },
    image() {
      return this.variants[this.selectedVariant].variantImage
    },
    sale() {
      if (this.onSale) {
        return this.brand + ' ' + this.product + ' are on sale!'
      }

      return this.brand + ' ' + this.product + ' are not on sale'
    },
    shipping() {
      if (this.premium) {
        return "Free"
      } else {
        return 2.99
      }
    }
  },

  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview);
    })
  }

});


var app = new Vue({
  el: '#app',

  data: {
    premium: true,
    cart: []
  },

  methods: {
    updateCart(id) {
      this.cart.push(id)
    },

    removeFromCart(id) {
      for (var i = this.cart.length - 1; i >= 0; i--) {
        if (this.cart[i] === id) {
          this.cart.splice(i, 1);
        }
      }
    }
  }
});