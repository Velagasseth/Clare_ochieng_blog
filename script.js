
// Shared functionality for both pages
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Check if we're on the public page
    if (document.querySelector('.story-grid')) {
        loadPublicPosts();
    }
    
    // Check if we're on the admin page
    if (document.getElementById('post-form')) {
        setupAdminPage();
    }

      if (document.getElementById('login-form')) {
        setupLoginPage();
    }
    
    // Check if we're on admin page and require auth
    if (document.getElementById('post-form')) {
        checkAdminAuth();
    }
});





// Local storage for posts (in a real app, this would be a database)
const STORAGE_KEY = 'clare_journalism_posts';

// Public page functionality
function loadPublicPosts() {
    const posts = getPosts();
    
    if (posts.length === 0) {
        // Sample data for first-time visitors
        const samplePosts = [
         
       
         
        ];
        
        savePosts(samplePosts);
        displayPosts(samplePosts);
    } else {
        displayPosts(posts);
    }
}

function displayPosts(posts) {
    const featuredStoryContainer = document.getElementById('featured-story');
    const storyGridContainer = document.getElementById('story-grid');
    
    // Clear existing content
    featuredStoryContainer.innerHTML = '';
    storyGridContainer.innerHTML = '';
    
    // Find featured post
    const featuredPost = posts.find(post => post.featured);
    
    // Display featured post
    if (featuredPost) {
        featuredStoryContainer.innerHTML = `
            <h3>${featuredPost.title}</h3>
            ${featuredPost.image ? `<img src="${featuredPost.image}" alt="${featuredPost.title}">` : ''}
            <p>${featuredPost.summary}</p>
            <p><small>Published on ${featuredPost.date}</small></p>
            <a href="#" class="read-more">Read Full Story</a>
        `;
    }
    
    // Display other posts
    posts.filter(post => !post.featured).forEach(post => {
        const storyCard = document.createElement('div');
        storyCard.className = 'story-card';
        storyCard.innerHTML = `
            ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}
            <div class="story-content">
                <h3>${post.title}</h3>
                <p>${post.summary}</p>
                <p><small>Published on ${post.date}</small></p>
                <a href="#" class="read-more">Read More</a>
            </div>
        `;
        storyGridContainer.appendChild(storyCard);
    });
}

// Admin page functionality
function setupAdminPage() {
    const postForm = document.getElementById('post-form');
    const saveDraftBtn = document.getElementById('save-draft');
    const postListContainer = document.getElementById('post-list');
    
    // Load existing posts
    loadAdminPosts();
    
    // Form submission
    postForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('post-title').value;
        const summary = document.getElementById('post-summary').value;
        const content = document.getElementById('post-content').value;
        const imageInput = document.getElementById('post-image');
        const video = document.getElementById('post-video').value;
        const isFeatured = document.getElementById('featured-post').checked;
        
        // In a real app, you would upload the image to a server
        // For this demo, we'll just use the file name
        let image = '';
        if (imageInput.files.length > 0) {
            image = URL.createObjectURL(imageInput.files[0]);
        }
        
        const newPost = {
            id: Date.now(), // Simple unique ID
            title,
            summary,
            content,
            image,
            video,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            featured: isFeatured
        };
        
        // Save to local storage
        const posts = getPosts();
        posts.push(newPost);
        savePosts(posts);
        
        // Reset form
        postForm.reset();
        
        // Reload posts
        loadAdminPosts();
        
        alert('Post published successfully!');
    });
    
    // Save draft button
    saveDraftBtn.addEventListener('click', function() {
        alert('Draft saved! (In a real app, this would save to drafts)');
    });
}

function loadAdminPosts() {
    const posts = getPosts();
    const postListContainer = document.getElementById('post-list');
    
    postListContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postListContainer.innerHTML = '<p>No posts yet. Create your first post!</p>';
        return;
    }
    
    posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.innerHTML = `
            <div class="post-info">
                <h3>${post.title}</h3>
                <p>Published: ${post.date} | ${post.featured ? '⭐ Featured' : ''}</p>
            </div>
            <div class="post-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        
        // Add event listeners to buttons
        postItem.querySelector('.edit-btn').addEventListener('click', () => {
            editPost(post.id);
        });
        
        postItem.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this post?')) {
                deletePost(post.id);
            }
        });
        
        postListContainer.appendChild(postItem);
    });
}

function editPost(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    
    if (post) {
        // Fill the form with post data
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-summary').value = post.summary;
        document.getElementById('post-content').value = post.content;
        document.getElementById('post-video').value = post.video;
        document.getElementById('featured-post').checked = post.featured;
        
        // Scroll to form
        document.getElementById('new-post').scrollIntoView();
        
        // Change button text
        const submitButton = document.querySelector('#post-form button[type="submit"]');
        submitButton.textContent = 'Update Post';
        
        // Store the ID we're editing
        submitButton.dataset.editingId = postId;
    }
}

function deletePost(postId) {
    const posts = getPosts().filter(post => post.id !== postId);
    savePosts(posts);
    loadAdminPosts();
}

// Helper functions for local storage
function getPosts() {
    const postsJson = localStorage.getItem(STORAGE_KEY);
    return postsJson ? JSON.parse(postsJson) : [];
}

function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    
    // If we're on the public page, refresh the display
    if (document.querySelector('.story-grid')) {
        displayPosts(posts);
    }
}

// Add these to the existing script.js

// Article page functionality
if (document.getElementById('full-article')) {
    loadFullArticle();
}

function loadFullArticle() {
    const articleId = parseInt(new URLSearchParams(window.location.search).get('id'));
    const posts = getPosts();
    const article = posts.find(post => post.id === articleId);
    const articleContainer = document.getElementById('full-article');
    
    if (article) {
        articleContainer.innerHTML = `
            <h2>${article.title}</h2>
            <p class="article-meta">Published on ${article.date} ${article.featured ? '| ⭐ Featured' : ''}</p>
            ${article.image ? `<img src="${article.image}" alt="${article.title}">` : ''}
            <div class="article-content">${article.content}</div>
            ${article.video ? `
                <div class="video-embed">
                    <iframe width="100%" height="400" src="${embedVideoUrl(article.video)}" 
                    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            ` : ''}
        `;
    } else {
        articleContainer.innerHTML = `
            <div class="error-message">
                <h3>Article Not Found</h3>
                <p>The requested article could not be found.</p>
                <a href="index.html" class="back-btn">Return to Home</a>
            </div>
        `;
    }
}

function embedVideoUrl(url) {
    // Simple YouTube URL conversion to embed URL
    if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1].split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
}

// Update the displayPosts function to link to article pages
function displayPosts(posts) {
    const featuredStoryContainer = document.getElementById('featured-story');
    const storyGridContainer = document.getElementById('story-grid');
    
    featuredStoryContainer.innerHTML = '';
    storyGridContainer.innerHTML = '';
    
    const featuredPost = posts.find(post => post.featured);
    
    if (featuredPost) {
        featuredStoryContainer.innerHTML = `
            <h3>${featuredPost.title}</h3>
            ${featuredPost.image ? `<img src="${featuredPost.image}" alt="${featuredPost.title}">` : ''}
            <p>${featuredPost.summary}</p>
            <p><small>Published on ${featuredPost.date}</small></p>
            <a href="article.html?id=${featuredPost.id}" class="read-more">Read Full Story</a>
        `;
    }
    
    posts.filter(post => !post.featured).forEach(post => {
        const storyCard = document.createElement('div');
        storyCard.className = 'story-card';
        storyCard.innerHTML = `
            ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}
            <div class="story-content">
                <h3>${post.title}</h3>
                <p>${post.summary}</p>
                <p><small>Published on ${post.date}</small></p>
                <a href="article.html?id=${post.id}" class="read-more">Read More</a>
            </div>
        `;
        storyGridContainer.appendChild(storyCard);
    });
}