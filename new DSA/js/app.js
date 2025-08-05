// app.js

// Utility Functions
function getUsersFromStorage() {
  let users = localStorage.getItem("users");
  return users ? JSON.parse(users) : {};
}

function saveUsersToStorage(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
  let currentUser = localStorage.getItem("currentUser");
  return currentUser ? JSON.parse(currentUser) : null;
}

function updateCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function getOtherUsers() {
  let users = getUsersFromStorage();
  let currentUser = getCurrentUser();
  if (!users || !currentUser) {
    return {};
  }
  let otherUsers = {};
  for (let username in users) {
    if (users.hasOwnProperty(username)) {
      let user = users[username];
      if (
        user.email !== currentUser.email &&
        (!currentUser.friends || !currentUser.friends[username])
      ) {
        otherUsers[username] = user;
      }
    }
  }
  return otherUsers;
}

function getUserByUsername(username) {
  let users = getUsersFromStorage();
  return users[username] || null;
}

// Form Submissions
function initializeFormSubmissions() {
  // Signup Form
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const profilePictureInput = document.getElementById("profilePicture");
      const about = document.getElementById("about").value.trim();

      if (!username || !email || !password || !confirmPassword) {
        alert("All fields are required.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      let users = getUsersFromStorage();

      if (users[username]) {
        alert("Username already taken! Please choose another one.");
        return;
      }

      const emailExists = Object.values(users).some(
        (user) => user.email === email
      );
      if (emailExists) {
        alert("Email is already registered! Please use another one.");
        return;
      }

      const profilePictureFile = profilePictureInput.files[0];
      if (profilePictureFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const profilePictureURL = e.target.result;
          users[username] = {
            username: username,
            email: email,
            password: password,
            friends: {},
            posts: [],
            profilePicture: profilePictureURL,
            about: about,
          };
          saveUsersToStorage(users);
          alert("User registered successfully!");
          window.location.href = "index.html";
        };
        reader.readAsDataURL(profilePictureFile);
      } else {
        users[username] = {
          username: username,
          email: email,
          password: password,
          friends: {},
          posts: [],
          profilePicture: null,
          about: about,
        };
        saveUsersToStorage(users);
        alert("User registered successfully!");
        window.location.href = "index.html";
      }
    });
  }

  // Login Form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      let userFound = false;
      const users = getUsersFromStorage();
      for (let username in users) {
        if (users.hasOwnProperty(username)) {
          const user = users[username];
          if (user.email === email && user.password === password) {
            updateCurrentUser(user);
            userFound = true;
            break;
          }
        }
      }
      if (userFound) {
        window.location.href = "dashboard.html";
      } else {
        alert("Incorrect email or password. Please try again.");
      }
    });
  }
}

// Friend Management
function initializeFriendManagement() {
  // Navigation Buttons
  const addFriendBtn = document.getElementById("add_friends");
  if (addFriendBtn) {
    addFriendBtn.addEventListener("click", function (event) {
      window.location.href = "addfriends.html";
    });
  }

  const showFriendsBtn = document.getElementById("show_friends");
  if (showFriendsBtn) {
    showFriendsBtn.addEventListener("click", function (event) {
      window.location.href = "friends.html";
    });
  }

  const mutualFriendsBtn = document.getElementById("mutual_friends");
  if (mutualFriendsBtn) {
    mutualFriendsBtn.addEventListener("click", function (event) {
      window.location.href = "mutualfriends.html";
    });
  }

  const suggestionsBtn = document.getElementById("friends_suggestions");
  if (suggestionsBtn) {
    suggestionsBtn.addEventListener("click", function (event) {
      window.location.href = "suggestions.html";
    });
  }

  const profileBtn = document.getElementById("profile");
  if (profileBtn) {
    profileBtn.addEventListener("click", function (event) {
      window.location.href = "profile.html";
    });
  }

  const logoutBtn = document.getElementById("log_out");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (event) {
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    });
  }

  // Back Buttons
  ["back", "back2", "close", "close2"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => {
        window.location.href = "dashboard.html";
      });
    }
  });
}

function displayUsers() {
  const users = getOtherUsers();
  const userList = document.getElementById("user-list");
  if (!userList) return;
  userList.innerHTML = "";

  for (let username in users) {
    if (users.hasOwnProperty(username)) {
      const user = users[username];
      const card = document.createElement("div");
      card.className = "col-md-4 col-lg-3 mb-4";

      card.innerHTML = `
        <div class="card user-card h-100">
          <img src="${
            user.profilePicture
              ? user.profilePicture
              : "https://via.placeholder.com/100"
          }" alt="${user.username}" class="user-avatar">
          <div class="card-body text-center">
            <h5 class="card-title">${user.username}</h5>
            <button class="btn btn-success btn-sm add-friend-btn" id="add_to_friends_${
              user.username
            }">
              <i class="fa fa-plus me-1"></i>Add Friend
            </button>
          </div>
        </div>
      `;
      userList.appendChild(card);
    }
  }
  addEventListenersToAddFriendButtons();
}

function addEventListenersToAddFriendButtons() {
  const addFriendButtons = document.querySelectorAll(".add-friend-btn");
  addFriendButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      const buttonId = event.currentTarget.id;
      const friendUsername = buttonId.replace("add_to_friends_", "");
      addFriend(friendUsername);
    });
  });
}

function addFriend(friendUsername) {
  const users = getUsersFromStorage();
  const currentUser = getCurrentUser();
  const friend = getUserByUsername(friendUsername);

  if (!currentUser || !friend) {
    alert("Unable to add friend.");
    return;
  }

  if (currentUser.friends[friendUsername]) {
    alert(`${friendUsername} is already your friend.`);
    return;
  }

  // Add friend to current user
  currentUser.friends[friendUsername] = {
    username: friend.username,
    email: friend.email,
  };

  // Add current user to friend's friends
  friend.friends[currentUser.username] = {
    username: currentUser.username,
    email: currentUser.email,
  };

  // Update storage
  users[currentUser.username] = currentUser;
  users[friendUsername] = friend;
  saveUsersToStorage(users);
  updateCurrentUser(currentUser);

  alert(`${friendUsername} has been added to your friends list.`);
  displayUsers(); // Refresh the Add Friends page if applicable
}

function displayFriends() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("No user is currently logged in.");
    return;
  }

  const userList = document.getElementById("user-list");
  if (!userList) return;
  userList.innerHTML = "";

  if (Object.keys(currentUser.friends).length === 0) {
    userList.innerHTML =
      "<p class='text-center text-muted'>You have no friends to display.</p>";
    return;
  }

  for (let friendUsername in currentUser.friends) {
    if (currentUser.friends.hasOwnProperty(friendUsername)) {
      const friend = getUserByUsername(friendUsername);
      if (!friend) continue;

      const card = document.createElement("div");
      card.className = "col-md-4 col-lg-3 mb-4";

      card.innerHTML = `
        <div class="card friend-card">
          <img src="${
            friend.profilePicture
              ? friend.profilePicture
              : "https://via.placeholder.com/100"
          }" alt="${friend.username}" class="friend-avatar">
          <div class="card-body text-center">
            <h5 class="card-title">${friend.username}</h5>
            <button class="btn btn-danger btn-sm remove-friend-btn" id="remove_friend_${
              friend.username
            }">
              <i class="fa fa-minus me-1"></i>Remove Friend
            </button>
          </div>
        </div>
      `;
      userList.appendChild(card);
    }
  }
  addEventListenersToRemoveFriendButtons();
}

function addEventListenersToRemoveFriendButtons() {
  const removeFriendButtons = document.querySelectorAll(".remove-friend-btn");
  removeFriendButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      const buttonId = event.currentTarget.id;
      const friendUsername = buttonId.replace("remove_friend_", "");
      removeFriend(friendUsername);
    });
  });
}

function removeFriend(friendUsername) {
  const users = getUsersFromStorage();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("No user is currently logged in.");
    return;
  }

  const friend = getUserByUsername(friendUsername);
  if (!friend) {
    alert("Friend not found.");
    return;
  }

  delete currentUser.friends[friendUsername];
  delete friend.friends[currentUser.username];

  users[currentUser.username] = currentUser;
  users[friendUsername] = friend;

  saveUsersToStorage(users);
  updateCurrentUser(currentUser);

  alert(`${friendUsername} has been removed from your friends list.`);
  displayFriends(); // Refresh the Friends page
}

// Mutual Friends
function getMutualFriends() {
  const users = getUsersFromStorage();
  const currentUser = getCurrentUser();

  if (!users || !currentUser || !currentUser.friends) {
    return { uniqueMutualFriends: [], mutualFriendPairs: [] };
  }

  const mutualFriends = [];
  const mutualFriendPairs = [];

  for (let friendUsername in currentUser.friends) {
    const friend = users[friendUsername];
    if (!friend || !friend.friends) continue;

    for (let mutualUsername in friend.friends) {
      if (
        currentUser.friends[mutualUsername] &&
        mutualUsername !== currentUser.username
      ) {
        mutualFriends.push(mutualUsername);
        mutualFriendPairs.push({
          mutualFriend: mutualUsername,
          friend1: currentUser.username,
          friend2: friendUsername,
        });
      }
    }
  }

  const uniqueMutualFriends = [...new Set(mutualFriends)];

  return { uniqueMutualFriends, mutualFriendPairs };
}

function displayMutualFriends() {
  const { uniqueMutualFriends, mutualFriendPairs } = getMutualFriends();
  const users = getUsersFromStorage();
  const userList = document.getElementById("user-list");
  if (!userList) return;
  userList.innerHTML = "";

  if (uniqueMutualFriends.length === 0) {
    userList.innerHTML =
      "<p class='text-center text-muted'>You have no mutual friends to display.</p>";
    return;
  }

  uniqueMutualFriends.forEach((mutualUsername) => {
    const mutualUser = getUserByUsername(mutualUsername);
    if (!mutualUser) return;

    const relatedPairs = mutualFriendPairs.filter(
      (pair) => pair.mutualFriend === mutualUsername
    );
    const connections = relatedPairs
      .map((pair) => `${pair.friend1} & ${pair.friend2}`)
      .join(", ");

    const card = document.createElement("div");
    card.className = "col-md-6 col-lg-4 mb-4";

    card.innerHTML = `
      <div class="card mutual-friend-card h-100">
        <img src="${
          mutualUser.profilePicture
            ? mutualUser.profilePicture
            : "https://via.placeholder.com/100"
        }" alt="${mutualUser.username}" class="mutual-friend-avatar">
        <div class="card-body text-center">
          <h5 class="card-title">${mutualUser.username}</h5>
          <p class="card-text"><strong>Mutual between:</strong> ${connections}</p>
        </div>
        <div class="card-footer text-center">
          <button class="btn btn-danger btn-sm remove-friend-btn" id="remove_friend_${
            mutualUser.username
          }">
            <i class="fa fa-minus me-1"></i>Remove Friend
          </button>
        </div>
      </div>
    `;
    userList.appendChild(card);
  });

  addEventListenersToRemoveFriendButtons();
}

// Friend Suggestions
function getFriendSuggestions() {
  const users = getUsersFromStorage();
  const currentUser = getCurrentUser();

  if (!users || !currentUser || !currentUser.friends) {
    return [];
  }

  const suggestions = new Set();

  for (let friendUsername in currentUser.friends) {
    const friend = getUserByUsername(friendUsername);
    if (!friend || !friend.friends) continue;

    for (let fofUsername in friend.friends) {
      if (
        fofUsername !== currentUser.username &&
        !currentUser.friends[fofUsername] &&
        !suggestions.has(fofUsername)
      ) {
        suggestions.add(fofUsername);
      }
    }
  }

  return Array.from(suggestions);
}

function displaySuggestions() {
  const suggestions = getFriendSuggestions();
  const users = getUsersFromStorage();
  const suggestionsContainer = document.getElementById(
    "friend_suggestion_list"
  );
  if (!suggestionsContainer) return;
  suggestionsContainer.innerHTML = "";

  if (suggestions.length === 0) {
    suggestionsContainer.innerHTML =
      "<p class='text-center text-muted'>No friend suggestions available.</p>";
    return;
  }

  suggestions.forEach((friendUsername) => {
    const friend = getUserByUsername(friendUsername);
    const card = document.createElement("div");
    card.className = "col-md-4 col-lg-3 mb-4";

    card.innerHTML = `
      <div class="card user-card h-100">
        <img src="${
          friend.profilePicture
            ? friend.profilePicture
            : "https://via.placeholder.com/100"
        }" alt="${friend.username}" class="user-avatar">
        <div class="card-body text-center">
          <h5 class="card-title">${friend.username}</h5>
          <button class="btn btn-success btn-sm add-friend-btn" id="add_to_friends_${
            friend.username
          }">
            <i class="fa fa-plus me-1"></i>Add Friend
          </button>
        </div>
      </div>
    `;
    suggestionsContainer.appendChild(card);
  });

  addEventListenersToAddFriendButtons();
  displayUsers();
}

// Search Functionality
function handleSearch() {
  const searchBar = document.getElementById("search-bar");
  const searchResults = document.getElementById("search-results");
  if (!searchBar || !searchResults) return;

  const query = searchBar.value.toLowerCase();
  const users = getAllUsers();
  const filteredUsers = Object.keys(users).filter((username) =>
    username.toLowerCase().includes(query)
  );

  if (filteredUsers.length > 0 && query !== "") {
    searchResults.style.display = "block";
    searchResults.innerHTML = "";

    filteredUsers.forEach((username) => {
      const user = users[username];
      const userLink = document.createElement("a");
      userLink.href = "#";
      userLink.classList.add("dropdown-item");
      userLink.innerText = username;

      userLink.addEventListener("click", function () {
        viewUserProfile(user);
      });

      searchResults.appendChild(userLink);
    });
  } else {
    searchResults.style.display = "none";
  }
}

function viewUserProfile(user) {
  window.location.href = `profile.html?username=${encodeURIComponent(
    user.username
  )}`;
}

// Post Management
function addPost(content, imageURL = null) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("No user is currently logged in.");
    return;
  }

  const users = getUsersFromStorage();
  const user = getUserByUsername(currentUser.username);
  if (!user) {
    alert("User data not found.");
    return;
  }

  const post = {
    content: content,
    timestamp: new Date().toISOString(),
    image: imageURL, // Data URL stored here
  };

  user.posts.push(post);
  users[currentUser.username] = user;
  saveUsersToStorage(users);
  updateCurrentUser(user);

  alert("Post added successfully!");
}

function getCurrentUserPosts() {
  const users = getUsersFromStorage();
  const currentUser = getCurrentUser();
  return users[currentUser.username]?.posts || [];
}

function getFriendsOfCurrentUser() {
  const users = getUsersFromStorage();
  const currentUser = getCurrentUser();

  if (!currentUser || !users || !users[currentUser.username]) {
    return [];
  }

  const userFriends = users[currentUser.username].friends;
  if (!userFriends) {
    return [];
  }

  const friendsArray = [];
  for (let friendUsername in userFriends) {
    if (userFriends.hasOwnProperty(friendUsername)) {
      const friend = getUserByUsername(friendUsername);
      if (friend) {
        friendsArray.push(friend);
      }
    }
  }

  return friendsArray;
}

function getFriendsPosts() {
  const friendsArray = getFriendsOfCurrentUser();
  const postsArray = [];

  friendsArray.forEach((friend) => {
    friend.posts.forEach((post) => {
      postsArray.push({
        ...post,
        username: friend.username,
      });
    });
  });

  return postsArray;
}

function sanitizeHTML(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}

function displayPosts() {
  const postsList = document.getElementById("posts-list");
  if (!postsList) return;

  const friendsPosts = getFriendsPosts();
  const currentUser = getCurrentUser();
  const currentUserPosts = getCurrentUserPosts().map((post) => ({
    ...post,
    username: currentUser.username,
  }));
  const combinedPosts = currentUserPosts.concat(friendsPosts);

  combinedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  postsList.innerHTML = "";

  combinedPosts.forEach((post) => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item";

    listItem.innerHTML = `
      <div class="card post-card">
        <div class="card-header">
          <strong>${post.username}</strong>
          <span class="text-muted float-end">${new Date(
            post.timestamp
          ).toLocaleString()}</span>
        </div>
        <div class="card-body">
          <p>${sanitizeHTML(post.content)}</p>
          ${
            post.image
              ? `<img src="${post.image}" class="img-fluid rounded" alt="Post Image">`
              : ""
          }
        </div>
        <div class="card-footer d-flex justify-content-between">
          <button class="btn btn-link"><i class="fas fa-thumbs-up me-1"></i>Like</button>
          <button class="btn btn-link"><i class="fas fa-comment me-1"></i>Comment</button>
          <button class="btn btn-link"><i class="fas fa-share me-1"></i>Share</button>
        </div>
      </div>
    `;
    postsList.appendChild(listItem);
  });
}

// Profile Management
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function displayProfile() {
  const usernameParam = getQueryParam("username");
  let userToDisplay;
  let isOwnProfile = false;

  if (usernameParam) {
    userToDisplay = getUserByUsername(usernameParam);
    if (!userToDisplay) {
      alert("User not found.");
      window.location.href = "dashboard.html";
      return;
    }
    const currentUser = getCurrentUser();
    isOwnProfile = currentUser.username === usernameParam;
  } else {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("No user is currently logged in.");
      window.location.href = "index.html";
      return;
    }
    userToDisplay = currentUser;
  }

  // Set Profile Image
  const profileImage = document.getElementById("profileImage");
  if (profileImage) {
    profileImage.src = userToDisplay.profilePicture
      ? userToDisplay.profilePicture
      : "https://via.placeholder.com/150";
  }

  // Set Username and About
  const usernameElem = document.getElementById("username");
  const aboutElem = document.getElementById("about");
  if (usernameElem) {
    usernameElem.textContent = userToDisplay.username;
  }
  if (aboutElem) {
    aboutElem.textContent = userToDisplay.about
      ? userToDisplay.about
      : "No bio available.";
  }

  // Display Friends
  const friendsList = document.getElementById("friendsList");
  const noFriendsMessage = document.getElementById("noFriendsMessage");
  if (friendsList && noFriendsMessage) {
    friendsList.innerHTML = "";
    const friends = userToDisplay.friends;
    if (Object.keys(friends).length === 0) {
      noFriendsMessage.style.display = "block";
    } else {
      noFriendsMessage.style.display = "none";
      for (let friendUsername in friends) {
        const friend = getUserByUsername(friendUsername);
        if (friend) {
          const card = document.createElement("div");
          card.className = "col-lg-3 col-md-4 col-sm-6 col-12 mb-4";

          card.innerHTML = `
            <div class="card friend-card">
              <a href="profile.html?username=${encodeURIComponent(
                friend.username
              )}" class="text-decoration-none text-dark">
                <img src="${
                  friend.profilePicture
                    ? friend.profilePicture
                    : "https://via.placeholder.com/100"
                }" alt="${friend.username}" class="card-img-top">
                <div class="card-body">
                  <h5 class="card-title">${friend.username}</h5>
                </div>
              </a>
            </div>
          `;
          friendsList.appendChild(card);
        }
      }
    }
  }

  // Display Posts
  const postsList = document.getElementById("posts-list");
  const noPostsMessage = document.getElementById("noPostsMessage");
  if (postsList && noPostsMessage) {
    const posts = userToDisplay.posts;
    postsList.innerHTML = "";
    if (posts.length === 0) {
      noPostsMessage.style.display = "block";
    } else {
      noPostsMessage.style.display = "none";
      posts.forEach((post) => {
        const postItem = document.createElement("li");
        postItem.className = "list-group-item p-0 mb-3";

        const postCard = document.createElement("div");
        postCard.className = "card post-card";

        postCard.innerHTML = `
          <div class="card-header d-flex align-items-center">
            <img src="${
              userToDisplay.profilePicture
                ? userToDisplay.profilePicture
                : "https://via.placeholder.com/40"
            }" alt="${
          userToDisplay.username
        }" class="me-3" width="40" height="40">
            <div>
              <h5 class="mb-0">${userToDisplay.username}</h5>
              <small class="text-muted">${new Date(
                post.timestamp
              ).toLocaleString()}</small>
            </div>
          </div>
          <div class="card-body">
            <p class="mb-2">${sanitizeHTML(post.content)}</p>
            ${
              post.image
                ? `<img src="${post.image}" class="img-fluid rounded" alt="Post Image">`
                : ""
            }
          </div>
          <div class="card-footer d-flex justify-content-around">
            <button class="btn btn-outline-primary btn-sm"><i class="fas fa-thumbs-up me-1"></i>Like</button>
            <button class="btn btn-outline-secondary btn-sm"><i class="fas fa-comment me-1"></i>Comment</button>
            <button class="btn btn-outline-success btn-sm"><i class="fas fa-share me-1"></i>Share</button>
          </div>
        `;

        postItem.appendChild(postCard);
        postsList.appendChild(postItem);
      });
    }
  }

  // Handle Add Friend Button
  const addFriendButton = document.getElementById("addFriendButton");
  if (addFriendButton) {
    if (usernameParam && !isOwnProfile) {
      const currentUser = getCurrentUser();
      const isFriend =
        currentUser.friends && currentUser.friends[userToDisplay.username];
      if (!isFriend) {
        addFriendButton.style.display = "block";
        addFriendButton.innerHTML = `<i class="fas fa-user-plus me-1"></i>Add Friend`;
        addFriendButton.classList.remove("btn-secondary");
        addFriendButton.classList.add("btn-primary");
        addFriendButton.disabled = false;

        addFriendButton.addEventListener("click", () => {
          addFriend(userToDisplay.username);
          addFriendButton.textContent = "Friends";
          addFriendButton.classList.remove("btn-primary");
          addFriendButton.classList.add("btn-secondary");
          addFriendButton.disabled = true;
        });
      } else {
        addFriendButton.style.display = "block";
        addFriendButton.innerHTML = `<i class="fas fa-user-check me-1"></i>Friends`;
        addFriendButton.classList.remove("btn-primary");
        addFriendButton.classList.add("btn-secondary");
        addFriendButton.disabled = true;
      }
    } else {
      addFriendButton.style.display = "none";
    }
  }
}

// Search Helper Function
function getAllUsers() {
  return getUsersFromStorage();
}

// Initialization
function initializeApp() {
  initializeFormSubmissions();
  initializeFriendManagement();

  // Handle "Show Password" checkbox
  const showPasswordCheckbox = document.getElementById("showPassword");
  if (showPasswordCheckbox) {
    const passwordInput = document.getElementById("password");
    showPasswordCheckbox.addEventListener("change", function () {
      passwordInput.type = this.checked ? "text" : "password";
    });
  }

  const path = window.location.pathname;
  const page = path.split("/").pop();

  switch (page) {
    case "dashboard.html":
      displayPosts();
      break;
    case "addfriends.html":
      displayUsers();
      break;
    case "friends.html":
      displayFriends();
      break;
    case "mutualfriends.html":
      displayMutualFriends();
      break;
    case "suggestions.html":
      displaySuggestions();
      break;
    case "profile.html":
      displayProfile();
      break;
    default:
      break;
  }

  // Initialize Search Functionality
  const searchBar = document.getElementById("search-bar");
  if (searchBar) {
    searchBar.addEventListener("input", handleSearch);
  }

  // Initialize Post Form on Dashboard
  const postForm = document.getElementById("postForm");
  if (postForm) {
    const charCount = document.getElementById("char-count");
    const contentTextarea = document.getElementById("content");
    const postImageInput = document.getElementById("post-image");

    if (contentTextarea && charCount) {
      contentTextarea.addEventListener("input", () => {
        const count = contentTextarea.value.length;
        charCount.textContent = `${count}/500`;
      });
    }

    postForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const content = contentTextarea.value.trim();
      const imageFile = postImageInput.files[0];

      if (content) {
        if (imageFile) {
          const reader = new FileReader();
          reader.onload = function (e) {
            const imageURL = e.target.result; // Data URL
            addPost(content, imageURL);
            displayPosts();
            postForm.reset();
            if (charCount) charCount.textContent = `0/500`;
          };
          reader.readAsDataURL(imageFile);
        } else {
          addPost(content, null);
          displayPosts();
          postForm.reset();
          if (charCount) charCount.textContent = `0/500`;
        }
      }
    });
  }

  // Handle back buttons with specific IDs
  ["back", "back2", "close", "close2"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => {
        window.location.href = "dashboard.html";
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", initializeApp);
