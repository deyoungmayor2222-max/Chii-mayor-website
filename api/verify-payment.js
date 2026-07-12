export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { reference } = req.body;

console.log("Reference:", reference);
console.log(
  "Secret key available:",
  !!process.env.PAYSTACK_SECRET_KEY
);

  if (!reference) {
    return res.status(400).json({ error: "Payment reference is required." });
  }

  try {

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    console.log("Secret key exists:", !!secretKey);
    console.log("Secret key prefix:", secretKey?.substring(0, 8));
    console.log("Secret key length:", secretKey?.length);

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const data = await response.json();

if (!response.ok) {
  return res.status(response.status).json(data);
}

if (!data.status || data.data.status !== "success") {
  return res.status(400).json({
    status: false,
    error: "Payment was not successful."
  });
}

// Verify the payment currency
  if (data.data.currency !== "NGN") {
    return res.status(400).json({
      status: false,
      error: "Invalid currency."
    });
  }

return res.status(200).json(data);

  } catch (error) {
  console.error("Paystack verification error:", error);

  return res.status(500).json({
    error: "Unable to verify payment."
  });
}
}