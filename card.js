const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();
const { creditAccount } = require("./helpers/transaction");
const CardTransaction = require("./models/Card_Transactions");

function processCardPaymentResult(data) {
  switch (data.data.data.status) {
    case "failed":
      return {
        success: false,
        error: data.data.data.message,
      };
    case "success":
      return {
        success: true,
        shouldCreditAccount: true,
        message: data.data.data.message,
      };
    default:
      return {
        success: true,
        shouldCreditAccount: false,
        message: data.data.data.status,
      };
  }
}

async function chargeCard({
  accountId,
  pan,
  expiry_year,
  expiry_month,
  cvv,
  email,
  amount,
}) {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const charge = await axios.post(
      "https://api.paystack.co/charge",
      {
        card: {
          number: pan,
          cvv,
          expiry_year,
          expiry_month,
        },
        email,
        amount,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
        },
      }
    );
    const nextAction = processCardPaymentResult(charge);
    console.log(nextAction);
    await CardTransaction.create({
      external_reference: charge.data.data.reference,
    });
    if (!nextAction) {
      await session.abortTransaction();
      session.endSession();
      return {
        success: nextAction.success,
        error: nextAction.error,
      };
    }

    if (nextAction.shouldCreditAccount) {
      await creditAccount({
        amount,
        account_id: accountId,
        purpose: "card_funding",
        metadata: {
          external_reference: charge.data.data.reference,
        },
      });
      await session.commitTransaction();
      session.endSession();
      return {
        success: true,
        message: "Charge successful",
      };
    }
    if (nextAction.message === "send_pin") {
      const result = await submitPin({
        accountId,
        reference: charge.data.data.reference,
        amount,
        pin: "1111",
      });
      if (!result.success) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          error: result.error,
        };
      }

      if (result.shouldCreditAccount) {
        await creditAccount({
          amount,
          account_id: accountId,
          purpose: "card_funding",
          metadata: {
            external_reference: charge.data.data.reference,
          },
        });
        await session.commitTransaction();
        session.endSession();
        return {
          success: true,
          message: "Charge successful",
        };
      }
    }
    return {
      status: true,
      message: "Extra validation required",
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return {
      success: false,
      error,
    };
  }
}

async function submitPin({ reference, pin }) {
  const charge = await axios.post(
    "https://api.paystack.co/charge/submit_pin",
    {
      reference,
      pin,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
      },
    }
  );
  if (charge.data.data.status === "success") {
    return {
      success: true,
      shouldCreditAccount: true,
      message: "Charge successful",
    };
  }
  return {
    success: true,
    shouldCreditAccount: false,
    message: charge.data.data.message,
  };
}

module.exports =  chargeCard ;
