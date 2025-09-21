// script.js

const API_BASE_URL = 'http://127.0.0.1:8000/api/'; // REPLACE with your deployed PythonAnywhere API URL!
const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USERNAME_KEY = 'username';

// --- DOM Elements ---
const loginLink = document.getElementById('login-link');
const logoutLink = document.getElementById('logout-link');
const createPollLink = document.getElementById('create-poll-link');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
const pollsContainer = document.getElementById('polls-container');
const noPollsMessage = document.getElementById('no-polls-message');
const pollDetailSection = document.getElementById('poll-detail-section');
const createPollSection = document.getElementById('create-poll-section');
const pollListSection = document.getElementById('poll-list-section');


// --- Utility Functions ---

function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function getUsername() {
    return localStorage.getItem(USERNAME_KEY);
}

function setAuthTokens(access, refresh, username) {
    localStorage.setItem(AUTH_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(USERNAME_KEY, username);
    updateAuthUI();
}

function clearAuthTokens() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    updateAuthUI();
}

async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        clearAuthTokens();
        return null;
    }
    try {
        const response = await fetch(`${API_BASE_URL}token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
        });
        if (!response.ok) throw new Error('Failed to refresh token');
        const data = await response.json();
        setAuthTokens(data.access, refreshToken, getUsername()); // Keep existing username
        return data.access;
    } catch (error) {
        console.error('Token refresh failed:', error);
        clearAuthTokens();
        return null;
    }
}

// Custom fetch wrapper to handle token refresh
async function authenticatedFetch(url, options = {}) {
    let token = getAuthToken();
    if (!token) {
        // Attempt to refresh if no token exists
        token = await refreshAccessToken();
        if (!token) {
            // No token and no refresh token, or refresh failed. User needs to log in.
            return { status: 401, json: async () => ({ detail: 'Authentication required' }) };
        }
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    let response = await fetch(url, options);

    // If token expired, try to refresh and retry the request
    if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            options.headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, options); // Retry with new token
        } else {
            // Still 401 after refresh attempt, truly unauthorized
            clearAuthTokens();
        }
    }
    return response;
}


function updateAuthUI() {
    const token = getAuthToken();
    const username = getUsername();
    if (token && username) {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'inline-block';
        createPollLink.style.display = 'inline-block';
        userInfo.style.display = 'inline-block';
        usernameDisplay.textContent = username;
    } else {
        loginLink.style.display = 'inline-block';
        logoutLink.style.display = 'none';
        createPollLink.style.display = 'none';
        userInfo.style.display = 'none';
        usernameDisplay.textContent = '';
    }
}

function hideAllSections() {
    pollListSection.style.display = 'none';
    pollDetailSection.style.display = 'none';
    createPollSection.style.display = 'none';
    // Add other sections if you expand this
}

// --- Render Functions ---

function renderPollCard(poll) {
    const pollCard = document.createElement('div');
    pollCard.className = 'poll-card';
    pollCard.innerHTML = `
        <h3>${poll.question}</h3>
        <p>Published: ${new Date(poll.pub_date).toLocaleDateString()}</p>
        <p>${poll.end_date ? `Ends: ${new Date(poll.end_date).toLocaleDateString()}` : 'No end date'}</p>
        <a href="#poll/${poll.id}" class="view-button">View Poll</a>
    `;
    return pollCard;
}

function renderPollDetail(poll, hasVoted, isLoggedIn) {
    let choicesHtml = '';
    let isPollExpired = poll.end_date ? new Date(poll.end_date) < new Date() : false;

    if (hasVoted || isPollExpired) {
        // Show results
        let totalVotes = poll.choices.reduce((sum, choice) => sum + choice.votes_count, 0);
        choicesHtml = poll.choices.map(choice => {
            const percentage = totalVotes > 0 ? ((choice.votes_count / totalVotes) * 100).toFixed(1) : 0;
            return `
                <div class="choice-result">
                    <span class="choice-text">${choice.choice_text}</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${percentage}%">${percentage}%</div>
                    </div>
                    <span class="vote-count">${choice.votes_count} votes</span>
                </div>
            `;
        }).join('');
        choicesHtml = `<div class="poll-results"><h2>Results</h2>${choicesHtml}<p>Total Votes: ${totalVotes}</p></div>`;
        if (isPollExpired) {
             choicesHtml += `<p style="color:red; font-weight:bold;">This poll has ended.</p>`;
        } else if (hasVoted) {
             choicesHtml += `<p style="color:green; font-weight:bold;">You have already voted in this poll.</p>`;
        }
    } else if (isLoggedIn) {
        // Show voting form
        choicesHtml = `
            <form id="vote-form">
                ${poll.choices.map(choice => `
                    <div class="form-group">
                        <input type="radio" id="choice-${choice.id}" name="choice_id" value="${choice.id}" required>
                        <label for="choice-${choice.id}">${choice.choice_text}</label>
                    </div>
                `).join('')}
                <button type="submit" class="btn btn-primary">Vote</button>
                <div id="vote-message" class="error-message"></div>
            </form>
        `;
    } else {
        // Not logged in, can't vote, show choices without options to vote
        choicesHtml = `
            <p>Please <a href="/login.html">log in</a> to cast your vote.</p>
            <ul>
                ${poll.choices.map(choice => `<li>${choice.choice_text}</li>`).join('')}
            </ul>
        `;
    }

    pollDetailSection.innerHTML = `
        <div class="card">
            <h1>${poll.question}</h1>
            <p>Published: ${new Date(poll.pub_date).toLocaleString()}</p>
            <p>${poll.end_date ? `Ends: ${new Date(poll.end_date).toLocaleString()}` : 'No end date specified'}</p>
            ${choicesHtml}
        </div>
    `;

    if (!hasVoted && isLoggedIn && !isPollExpired) {
        const voteForm = document.getElementById('vote-form');
        const voteMessage = document.getElementById('vote-message');
        voteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const choiceId = voteForm.elements['choice_id'].value;
            if (!choiceId) {
                voteMessage.textContent = 'Please select an option.';
                return;
            }
            try {
                const response = await authenticatedFetch(`${API_BASE_URL}polls/${poll.id}/vote/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ choice_id: choiceId })
                });
                const data = await response.json();
                if (response.ok) {
                    voteMessage.className = 'success-message';
                    voteMessage.textContent = 'Vote cast successfully!';
                    // Re-render poll detail to show results
                    loadPollDetail(poll.id);
                } else {
                    voteMessage.className = 'error-message';
                    voteMessage.textContent = data.detail || data.error || data.non_field_errors || JSON.stringify(data);
                }
            } catch (error) {
                console.error('Error casting vote:', error);
                voteMessage.className = 'error-message';
                voteMessage.textContent = 'An error occurred while voting.';
            }
        });
    }
}

// --- Load Data Functions ---

async function loadPolls() {
    pollsContainer.innerHTML = ''; // Clear previous polls
    noPollsMessage.style.display = 'block'; // Show loading message
    noPollsMessage.textContent = 'Loading polls...';

    try {
        const response = await fetch(`${API_BASE_URL}polls/`);
        const polls = await response.json();

        if (polls.length === 0) {
            noPollsMessage.textContent = 'No polls available yet.';
        } else {
            noPollsMessage.style.display = 'none';
            polls.forEach(poll => {
                pollsContainer.appendChild(renderPollCard(poll));
            });
        }
    } catch (error) {
        console.error('Error fetching polls:', error);
        noPollsMessage.textContent = 'Failed to load polls. Please try again later.';
    }
}

async function loadPollDetail(pollId) {
    hideAllSections();
    pollDetailSection.style.display = 'block';
    pollDetailSection.innerHTML = '<div class="card"><p>Loading poll details...</p></div>';

    const isLoggedIn = !!getAuthToken();
    let hasVoted = false; // Assume not voted until checked

    try {
        let pollResponse;
        if (isLoggedIn) {
             pollResponse = await authenticatedFetch(`${API_BASE_URL}polls/${pollId}/`);
        } else {
             pollResponse = await fetch(`${API_BASE_URL}polls/${pollId}/`);
        }

        if (!pollResponse.ok && pollResponse.status === 401) {
            // Not logged in or token expired, but poll data is public. Re-fetch public data.
            pollResponse = await fetch(`${API_BASE_URL}polls/${pollId}/`);
        }

        const poll = await pollResponse.json();

        if (!pollResponse.ok) {
            pollDetailSection.innerHTML = `<div class="card"><p class="error-message">Error: ${poll.detail || poll.error || 'Poll not found.'}</p></div>`;
            return;
        }

        // Check if user has voted if logged in
        if (isLoggedIn) {
            try {
                // This is a simplified check. A more robust backend would have a specific endpoint
                // to check if the current user voted on a specific poll.
                // For now, we'll try to fetch votes for this user on this poll.
                // This might not be efficient or accurate without a custom endpoint.
                // Assuming `polls/{id}/results/` includes `user_vote_status` in its response if user is authenticated.
                // If not, a separate API call might be needed: e.g., /api/votes/?user=current&poll=pollId
                // For now, let's assume the results endpoint tells us.
                const userVotesResponse = await authenticatedFetch(`${API_BASE_URL}polls/${pollId}/results/`);
                if (userVotesResponse.ok) {
                    const resultsData = await userVotesResponse.json();
                    // Assuming your results endpoint might return an array of choices
                    // and each choice has a `voted_by_user` or similar flag for current user.
                    // If not, you'd need a custom API endpoint for this check.
                    hasVoted = resultsData.choices.some(choice =>
                        choice.votes.some(vote => vote.user === getUsername()) // This assumes vote includes username, which it might not.
                    );
                    // A better way: Backend 'polls/{id}/results/' response should explicitly say 'user_has_voted: true/false'
                    // For now, we simplify: if we can post a vote, user hasn't voted. If we get "already voted" error, then hasVoted=true
                }
            } catch (error) {
                console.warn("Could not check if user has voted (might need specific backend endpoint):", error);
            }
        }
        renderPollDetail(poll, hasVoted, isLoggedIn);
    } catch (error) {
        console.error('Error fetching poll detail:', error);
        pollDetailSection.innerHTML = '<div class="card"><p class="error-message">Failed to load poll details.</p></div>';
    }
}

// --- Event Listeners ---

logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    clearAuthTokens();
    window.location.hash = ''; // Go to home
    loadPolls();
});

// --- Routing (simple hash-based router) ---

function handleRouting() {
    const hash = window.location.hash;
    if (hash.startsWith('#poll/')) {
        const pollId = hash.substring(6);
        loadPollDetail(pollId);
    } else if (hash === '#create-poll') {
        hideAllSections();
        createPollSection.style.display = 'block';
        if (!getAuthToken()) {
            createPollSection.innerHTML = '<div class="card"><p class="error-message">You must be logged in to create a poll. Please <a href="/login.html">login</a>.</p></div>';
        } else {
            renderCreatePollForm();
        }
    } else {
        hideAllSections();
        pollListSection.style.display = 'block';
        loadPolls();
    }
    updateAuthUI(); // Always update UI on route change
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);


// --- Initial Load ---
updateAuthUI();
handleRouting(); // Initial routing on page load

// --- Create Poll Form (for create-poll.html or dynamic rendering) ---
function renderCreatePollForm() {
    createPollSection.innerHTML = `
        <div class="card">
            <h1>Create New Poll</h1>
            <form id="create-poll-form">
                <div class="form-group">
                    <label for="question">Poll Question:</label>
                    <input type="text" id="question" name="question" required>
                </div>
                <div id="choices-container">
                    <div class="form-group choice-input-group">
                        <label>Choice 1:</label>
                        <input type="text" name="choice_text" required>
                    </div>
                    <div class="form-group choice-input-group">
                        <label>Choice 2:</label>
                        <input type="text" name="choice_text" required>
                    </div>
                </div>
                <button type="button" id="add-choice-btn" class="btn btn-secondary">Add Another Choice</button>

                <div class="form-group">
                    <label for="end_date">End Date (Optional):</label>
                    <input type="datetime-local" id="end_date" name="end_date">
                </div>

                <button type="submit" class="btn btn-primary">Create Poll</button>
                <div id="create-poll-message" class="error-message"></div>
            </form>
        </div>
    `;

    const createPollForm = document.getElementById('create-poll-form');
    const choicesContainer = document.getElementById('choices-container');
    const addChoiceBtn = document.getElementById('add-choice-btn');
    const createPollMessage = document.getElementById('create-poll-message');
    let choiceCounter = 2; // Starting from 2 as we have 2 initial choices

    addChoiceBtn.addEventListener('click', () => {
        choiceCounter++;
        const newChoiceGroup = document.createElement('div');
        newChoiceGroup.className = 'form-group choice-input-group';
        newChoiceGroup.innerHTML = `
            <label>Choice ${choiceCounter}:</label>
            <input type="text" name="choice_text" required>
        `;
        choicesContainer.appendChild(newChoiceGroup);
    });

    createPollForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        createPollMessage.textContent = ''; // Clear previous messages

        const question = document.getElementById('question').value;
        const endDate = document.getElementById('end_date').value;
        const choiceInputs = document.querySelectorAll('#choices-container input[name="choice_text"]');
        const choices = Array.from(choiceInputs)
                            .map(input => input.value.trim())
                            .filter(val => val !== '');

        if (!question || choices.length < 2) {
            createPollMessage.className = 'error-message';
            createPollMessage.textContent = 'Please enter a question and at least two choices.';
            return;
        }

        const pollData = {
            question: question,
            choices: choices.map(text => ({ choice_text: text })) // Django backend expects choices to be part of Poll creation
        };
        if (endDate) {
            pollData.end_date = new Date(endDate).toISOString(); // Format to ISO string for Django
        }

        try {
            const response = await authenticatedFetch(`${API_BASE_URL}polls/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pollData)
            });
            const data = await response.json();
            if (response.ok) {
                createPollMessage.className = 'success-message';
                createPollMessage.textContent = 'Poll created successfully! Redirecting...';
                createPollForm.reset();
                setTimeout(() => {
                    window.location.hash = `poll/${data.id}`; // Go to new poll
                }, 1500);
            } else {
                createPollMessage.className = 'error-message';
                createPollMessage.textContent = data.detail || data.error || JSON.stringify(data);
                console.error('Error creating poll:', data);
            }
        } catch (error) {
            console.error('Network error creating poll:', error);
            createPollMessage.className = 'error-message';
            createPollMessage.textContent = 'An error occurred while creating the poll.';
        }
    });
}