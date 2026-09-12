const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      minlength: [6, "A tour name must have atleast 6 characters"],
      maxlength: [40, "A tour name must have atmost 40 characters"],
      unique: true,
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      default: 0,
      // Custom validator to check if discount is less than price
      validate: {
        validator: function (value) {
          return this.price > value;
        },
        message: "Discount price should be below regular price",
      },
    },
    summary: {
      type: String,
      required: [true, "A tour must have a summary"],
      trim: true,
    },
    slug: String,
    secret: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: {
      type: [Date],
      validate: {
        validator: (value) => {
          if (value.length > 0) return;
          return "A tour must have atleast one start date";
        },
      },
    },
    /* Sample GeoJSON data
    {
      type: 'Point'
      coordinates: [-114.2563, 56.8897]
      // additional attributes
    }
    */
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: {
          values: ["Point"],
          message: "Type can be only 'Point'",
        },
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        // GeoJSON
        type: {
          type: String,
          default: "Point",
          enum: {
            values: ["Point"],
            message: "Type can be only 'Point'",
          },
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }, // To enable virtuals
);

// Each review document has a tour field which stores the id of the tour with which it is associated
// We are storing the tour id in order to have parent referencing where tour(parent) & review(child).
// In this way, we can use populate on reviews but not on tours.
// In order to solve this, and get the reviews data for each tour we need to use virtual populate.
// Here we are creating a virtual property on tour schema called 'reviews'
// In order to derive the value of the virtual property, we need to set a ref which points to the
// Review model and specify the localField and foreignField.
// Here the connection is between tour(_id) -> review(tour).
// So with respect to tourSchema, localField is _id and foreignField is tour
// We will use populate('reviews') only on getTour controller becuase we ideally need to only fetch the reviews for tour detail page.

// Tour (_id) -> Review (tour)
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour'
})

// To populate guides data
// N + 1 query problem is eliminated if we use populate
tourSchema.pre(/^find/, function () {
  this.populate({
    path: "guides",
    select: "name email",
  });
});

// Virtual is used to create a property which doesn't need to be stored in the db and whose value can be derived from
// the value of other attribute
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// Document middleware
// Pre-save middleware -> This middleware function gets executed right before the document is getting saved into the DB
tourSchema.pre("save", function () {
  // Make sure to define the slug attribute on the tour schema
  this.slug = slugify(this.name, { lower: true });
});

// Post-save middleware -> This middleware function gets executed right after the document has been saved into the DB
tourSchema.post("save", function (doc) {
  console.log("Post save document middleware executed. Saved Document: ", doc);
});

// Query middleware
// Pre-find middleware -> This middleware function gets executed right before queries starting with find is executed
tourSchema.pre(/^find/, function () {
  this.find({
    secret: {
      $ne: true,
    },
  });
});

// Aggregation middleware
// Pre-aggregate middleware -> This middleware function gets executed right before the aggregation pipeline is executed
tourSchema.pre("aggregate", function () {
  this.pipeline().unshift({
    $match: {
      secret: {
        $ne: true,
      },
    },
  });
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
