// Import required modules
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const BASE_URL = 'https://localhost:3000/';


async function fetchUsers() {
    const response = await axios.get(`${BASE_URL}/users`);
    return response.data;
}


async function fetchPosts() {
    const response = await axios.get(`${BASE_URL}/posts`);
    return response.data;
}

// Fetch all comments
async function fetchComments() {
    const response = await axios.get(`${BASE_URL}/comments`);
    return response.data;
}

// Endpoint 1: Top Users (by number of posts)
app.get('/User', async (req, res) => {
    try {
        const posts = await fetchPosts();

        const userPostCounts = posts.reduce((acc, post) => {
            acc[post.userId] = (acc[post.userId] || 0) + 1;
            return acc;
        }, {});

        const sortedUsers = Object.entries(userPostCounts).sort((a, b) => b[1] - a[1]);
        const topUsers = sortedUsers.slice(0, 5).map(([userId, count]) => ({ userId, count }));

        res.json(topUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch top users' });
    }
});

app.get('/Posts', async (req, res) => {
    try {
        const posts = await fetchPosts();
        const comments = await fetchComments();

        const commentCounts = comments.reduce((acc, comment) => {
            acc[comment.postId] = (acc[comment.postId] || 0) + 1;
            return acc;
        }, {});

        const sortedPosts = posts.map(post => ({
            ...post,
            commentCount: commentCounts[post.id] || 0
        })).sort((a, b) => b.commentCount - a.commentCount);

        const topPosts = sortedPosts.slice(0, 5);

        res.json(topPosts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch top posts' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
