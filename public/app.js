async function send(endpoint) {
  const username = document.getElementById("username").value.trim();
  const message = document.getElementById("message").value.trim();
  const result = document.getElementById("result");

  if (!username) {
    result.textContent = "Please enter a username.";
    return;
  }

  if (!message) {
    result.textContent = "Please enter a message.";
    return;
  }

  result.textContent = "Sending...";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        message
      })
    });

    const data = await response.json();
    result.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    result.textContent = error.message;
  }
}

document.getElementById("dm").onclick = () => {
  send("/api/dm");
};

document.getElementById("friend").onclick = () => {
  send("/api/friend-request");
};
