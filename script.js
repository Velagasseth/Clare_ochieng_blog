
// Image error handler (add to your existing JS)
function handleImageError(imgElement) {
    imgElement.src = 'https://via.placeholder.com/800x400?text=Image+Error';
    imgElement.style.opacity = 1;
    imgElement.previousElementSibling.style.display = 'none';
    console.error('Image failed to load:', imgElement.alt);
}


function initImageLoading() {
    // Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            if (!img.complete) {
                imageObserver.observe(img);
            }
        });
    }
}

// Shared functionality for both pages
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    initImageLoading();


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


// Image handling constants
const UPLOADS_DIR = 'uploads/';
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Initialize image handling

// Handle image selection
function handleImageSelection(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('image-preview');
    const previewImage = document.getElementById('preview-image');
    const status = document.getElementById('upload-status');
    
    // Reset previous state
    preview.style.display = 'none';
    status.textContent = '';
    status.className = 'upload-status';
    
    if (!file) return;
    
    // Validate image
    if (!ALLOWED_TYPES.includes(file.type)) {
        showUploadStatus('Only JPG, PNG, GIF, or WEBP images are allowed', 'error');
        return;
    }
    
    if (file.size > MAX_IMAGE_SIZE) {
        showUploadStatus(`Image too large (max ${MAX_IMAGE_SIZE/1024/1024}MB)`, 'error');
        return;
    }
    
    // Preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.style.display = 'block';
        previewImage.src = e.target.result;
        showUploadStatus(`Ready to upload: ${file.name} (${(file.size/1024).toFixed(1)}KB)`, 'success');
    };
    reader.readAsDataURL(file);
}

// Handle image upload and storage
async function uploadAndStoreImage(file) {
    return new Promise((resolve, reject) => {
        try {
            // Create unique filename
            const extension = file.name.split('.').pop();
            const fileName = `img_${Date.now()}.${extension}`;
            const filePath = `${UPLOADS_DIR}${fileName}`;
            
            // Convert to base64 for localStorage (simulated upload)
            const reader = new FileReader();
            reader.onload = function(e) {
                // Store in localStorage (simulated file system)
                const uploads = JSON.parse(localStorage.getItem('journalism_uploads') || {});
                uploads[fileName] = {
                    name: fileName,
                    path: filePath,
                    data: e.target.result,
                    uploadedAt: new Date().toISOString()
                };
                localStorage.setItem('journalism_uploads', JSON.stringify(uploads));
                
                resolve(filePath);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        } catch (error) {
            reject(error);
        }
    });
}
function getImageUrl(imagePath) {
    if (!imagePath) return getPlaceholderImage('No+Image');
    
    // Handle blob URLs (temporary local images)
    if (imagePath.startsWith('blob:')) return imagePath;
    
    // Handle local uploads
    if (imagePath.startsWith(UPLOADS_DIR)) {
        const fileName = imagePath.replace(UPLOADS_DIR, '');
        const uploads = JSON.parse(localStorage.getItem('journalism_uploads') || '{}');
        return uploads[fileName]?.data || getPlaceholderImage('Image+Not+Found');
    }
    
    // Handle external URLs
    if (imagePath.startsWith('http')) {
        // Add cache busting for external images to prevent blinking
        return `${imagePath}?${new Date().getTime()}`;
    }
    
    return getPlaceholderImage('Invalid+Image');
}

// Helper functions
function showUploadStatus(message, type = 'info') {
    const status = document.getElementById('upload-status');
    status.textContent = message;
    status.className = `upload-status ${type}`;
}

function getPlaceholderImage(text) {
    return `https://via.placeholder.com/800x400?text=${text}`;
}

function handleImageErrors(event) {
    if (event.target.tagName === 'IMG') {
        event.target.src = getPlaceholderImage('Image+Error');
        event.target.style.border = '1px solid #e74c3c';
        event.target.style.padding = '5px';
    }
}




// Local storage for posts (in a real app, this would be a database)
const STORAGE_KEY = 'clare_journalism_posts';

// Public page functionality
function loadPublicPosts() {
    const posts = getPosts();
    
    if (posts.length === 0) {
        // Sample data for first-time visitors with proper image handling
        const samplePosts = [
            {
                id: 1,
                title: "Investigating Urban Development",
                summary: "A deep dive into city planning challenges",
                content: "<p>This article explores the complex issues surrounding urban development in growing cities.</p>",
                image: "https://via.placeholder.com/800x400?text=Urban+Development",
                video: "",
                date: new Date().toISOString().split('T')[0],
                featured: true
            },
            {
                id: 2,
                title: "Women in Tech: Breaking Barriers",
                summary: "How women are transforming the technology sector",
                content: "<p>An examination of the challenges and successes of women in technology fields.</p>",
                image: "https://via.placeholder.com/800x400?text=Women+in+Tech",
                video: "",
                date: new Date().toISOString().split('T')[0],
                featured: false
            }
        ];
        
        savePosts(samplePosts);
        displayPosts(samplePosts);
    } else {
        displayPosts(posts);
    }
}


// In script.js - Update the image display functions
function displayPosts(posts) {
    const featuredStoryContainer = document.getElementById('featured-story');
    const storyGridContainer = document.getElementById('story-grid');
    
    featuredStoryContainer.innerHTML = '';
    storyGridContainer.innerHTML = '';

    const featuredPost = posts.find(post => post.featured);
    
    if (featuredPost) {
        featuredStoryContainer.innerHTML = createPostHTML(featuredPost, true);
    }
    
    posts.filter(post => !post.featured).forEach(post => {
        const storyCard = document.createElement('div');
        storyCard.className = 'story-card';
        storyCard.innerHTML = createPostHTML(post, false);
        storyGridContainer.appendChild(storyCard);
    });
}

function createPostHTML(post, isFeatured) {
    const imageUrl = getImageUrl(post.image);
    return `
        <div class="post-image-container">
            <img src="${imageUrl}" 
                 alt="${post.title}"
                 loading="lazy"
                 onload="this.style.opacity = 1"
                 onerror="handleImageError(this)"
                 style="opacity: 0; transition: opacity 0.3s ease">
        </div>
        <div class="story-content">
            <h3>${post.title}</h3>
            <p>${post.summary}</p>
            <p><small>Published on ${post.date}</small></p>
            <a href="article.html?id=${post.id}" class="read-more">
                ${isFeatured ? 'Read Full Story' : 'Read More'}
            </a>
        </div>
    `;
}

// Global error handler
function handleImageError(imgElement) {
    imgElement.src = getPlaceholderImage('Image+Not+Available');
    imgElement.style.opacity = 1;
    imgElement.style.border = '1px solid #e74c3c';
    imgElement.style.padding = '5px';
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

function createPostHTML(post, isFeatured) {
    const imageUrl = getImageUrl(post.image);
    return `
        <div class="post-image-container">
            <img src="${imageUrl}" alt="${post.title}" 
                 onerror="this.src='${getPlaceholderImage('Image+Error')}'">
        </div>
        <div class="story-content">
            <h3>${post.title}</h3>
            <p>${post.summary}</p>
            <p><small>Published on ${post.date}</small></p>
            <a href="article.html?id=${post.id}" class="read-more">
                ${isFeatured ? 'Read Full Story' : 'Read More'}
            </a>
        </div>
    `;
}

async function createNewPost() {
    const title = document.getElementById('post-title').value;
    const summary = document.getElementById('post-summary').value;
    const content = document.getElementById('post-content').value;
    const imageInput = document.getElementById('post-image');
    const video = document.getElementById('post-video').value;
    const isFeatured = document.getElementById('featured-post').checked;
    
    let imagePath = '';
    
    // Handle image upload if present
    if (imageInput.files.length > 0) {
        try {
            // First create a blob URL for immediate display
            const blobUrl = URL.createObjectURL(imageInput.files[0]);
            
            // Then store the image properly
            imagePath = await uploadAndStoreImage(imageInput.files[0]);
            
            // Use the stored path, but fallback to blob URL if needed
            imagePath = imagePath || blobUrl;
            
            showUploadStatus('Image uploaded successfully!', 'success');
        } catch (error) {
            console.error('Image upload failed:', error);
            imagePath = getPlaceholderImage('Upload+Failed');
            showUploadStatus('Image upload failed. Using placeholder.', 'error');
        }
    }
    
    const newPost = {
        id: Date.now(),
        title,
        summary,
        content: formatContent(content),
        image: imagePath,
        video,
        date: new Date().toISOString().split('T')[0],
        featured: isFeatured
    };
    
    // Save and refresh
    const posts = getPosts();
    posts.push(newPost);
    savePosts(posts);
    loadAdminPosts();
    alert('Post published successfully!');
}