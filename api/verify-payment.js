export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { reference } = req.body;

  if (!reference) {
    return res.status(400).json({ error: "Payment reference is required." });
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
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