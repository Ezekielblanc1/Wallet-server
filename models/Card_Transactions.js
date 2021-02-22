const mongoose = require("mongoose");
const cardTransactionSchema = new mongoose.Schema(
  {
    external_reference: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("card_transactions", cardTransactionSchema);
