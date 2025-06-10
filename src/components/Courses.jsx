import { useState, useEffect } from 'react';
import React from 'react';
// import './Courses.css'; // Import your CSS file for styling

function Courses({ token, user }) {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State for Add Course Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('');
  const [newCourseLink, setNewCourseLink] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('');
  const [newCourseImageUrl, setNewCourseImageUrl] = useState('');

  // State for Edit Course Form
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null); // Stores the course being edited
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseDescription, setEditCourseDescription] = useState('');
  const [editCourseCategory, setEditCourseCategory] = useState('');
  const [editCourseLink, setEditCourseLink] = useState('');
  const [editCoursePrice, setEditCoursePrice] = useState('');
  const [editCourseImageUrl, setEditCourseImageUrl] = useState('');

  // For search/filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchCourses = async () => {
    setIsLoading(true);
    setError('');
    let url = 'http://localhost:5000/api/courses/displayall';
    const params = new URLSearchParams();
    if (filterCategory) params.append('category', filterCategory);
    if (searchTerm) params.append('search', searchTerm);
    if (params.toString()) url += `?${params.toString()}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setCourses(data.courses || []);
      } else {
        setError(data.message || 'Failed to fetch courses.');
      }
    } catch (err) {
      setError('Server error while fetching courses.');
      console.error('Fetch courses error:', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [filterCategory]); // Refetch when filterCategory changes

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses(); // Refetch with current searchTerm and filterCategory
  };

  const resetAddForm = () => {
    setNewCourseTitle('');
    setNewCourseDescription('');
    setNewCourseCategory('');
    setNewCourseLink('');
    setNewCoursePrice('');
    setNewCourseImageUrl('');
    setShowAddForm(false);
  };

  const resetEditForm = () => {
    setEditingCourse(null);
    setEditCourseTitle('');
    setEditCourseDescription('');
    setEditCourseCategory('');
    setEditCourseLink('');
    setEditCoursePrice('');
    setEditCourseImageUrl('');
    setShowEditForm(false);
  };

  const handleShowAddCourseForm = () => {
    resetAddForm(); // Clear any previous data
    setShowAddForm(true);
    setShowEditForm(false); // Ensure edit form is hidden
  };

  const handleShowEditCourseForm = (course) => {
    resetEditForm(); // Clear any previous data
    setEditingCourse(course);
    setEditCourseTitle(course.title);
    setEditCourseDescription(course.description || '');
    setEditCourseCategory(course.category || '');
    setEditCourseLink(course.link);
    setEditCoursePrice(course.price !== undefined ? String(course.price) : '');
    setEditCourseImageUrl(course.imageUrl || '');
    setShowEditForm(true);
    setShowAddForm(false); // Ensure add form is hidden
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        fetchCourses(); // Refresh the list
        alert('Course deleted successfully');
      } else {
        setError(data.message || 'Failed to delete course.');
        alert(`Error: ${data.message || 'Failed to delete course.'}`);
      }
    } catch (err) {
      setError('Server error while deleting course.');
      alert('Server error while deleting course.');
      console.error('Delete course error:', err);
    }
  };

  const handleAddCourseSubmit = async (e) => {
    e.preventDefault();
    if (!newCourseTitle || !newCourseLink) {
      setError('Title and Link are required for a new course.');
      return;
    }
    setError('');

    const courseData = {
      title: newCourseTitle,
      description: newCourseDescription,
      category: newCourseCategory,
      link: newCourseLink,
      price: newCoursePrice ? parseFloat(newCoursePrice) : undefined,
      imageUrl: newCourseImageUrl,
    };

    try {
      const response = await fetch('http://localhost:5000/api/courses/addcourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });
      const data = await response.json();
      if (response.ok) {
        fetchCourses(); // Refresh list
        resetAddForm();
        alert('Course added successfully!');
      } else {
        setError(data.message || 'Failed to add course.');
        alert(`Error: ${data.message || 'Failed to add course.'}`);
      }
    } catch (err) {
      setError('Server error while adding course.');
      alert('Server error while adding course.');
      console.error('Add course submit error:', err);
    }
  };

  const handleEditCourseSubmit = async (e) => {
    e.preventDefault();
    if (!editingCourse || !editCourseTitle || !editCourseLink) {
      setError('Title and Link are required to edit a course.');
      return;
    }
    setError('');

    const courseData = {
      title: editCourseTitle,
      description: editCourseDescription,
      category: editCourseCategory,
      link: editCourseLink,
      price: editCoursePrice ? parseFloat(editCoursePrice) : undefined,
      imageUrl: editCourseImageUrl,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/courses/${editingCourse._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });
      const data = await response.json();
      if (response.ok) {
        fetchCourses(); // Refresh list
        resetEditForm();
        alert('Course updated successfully!');
      } else {
        setError(data.message || 'Failed to update course.');
        alert(`Error: ${data.message || 'Failed to update course.'}`);
      }
    } catch (err) {
      setError('Server error while updating course.');
      alert('Server error while updating course.');
      console.error('Edit course submit error:', err);
    }
  };

  const canManageCourse = (course) => {
    if (!user) return false;
    return user.role === 'admin' || (course.createdBy && course.createdBy._id === user.id);
  };

  return (
    <div>
      <h2>Courses</h2>

      {/* Search and Filter Form */}
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Search by title..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Filter by category..." 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)} 
        />
        <button type="submit">Search/Filter</button>
        <button type="button" onClick={() => { setSearchTerm(''); setFilterCategory(''); fetchCourses(); }}>Clear</button>
      </form>

      {user && (user.role === 'admin' || user.role === 'contributor') && (
        <button onClick={handleShowAddCourseForm}>Add New Course</button>
      )}

      {/* Add Course Form */}
      {showAddForm && (
        <form onSubmit={handleAddCourseSubmit}>
          <h3>Add New Course</h3>
          <div>
            <label>Title:</label>
            <input type="text" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} required />
          </div>
          <div>
            <label>Description:</label>
            <textarea value={newCourseDescription} onChange={(e) => setNewCourseDescription(e.target.value)} />
          </div>
          <div>
            <label>Category:</label>
            <input type="text" value={newCourseCategory} onChange={(e) => setNewCourseCategory(e.target.value)} />
          </div>
          <div>
            <label>Link:</label>
            <input type="url" value={newCourseLink} onChange={(e) => setNewCourseLink(e.target.value)} required />
          </div>
          <div>
            <label>Price:</label>
            <input type="number" value={newCoursePrice} onChange={(e) => setNewCoursePrice(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label>Image URL:</label>
            <input type="url" value={newCourseImageUrl} onChange={(e) => setNewCourseImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
          </div>
          <button type="submit">Save Course</button>
          <button type="button" onClick={resetAddForm}>Cancel</button>
        </form>
      )}

      {/* Edit Course Form */}
      {showEditForm && editingCourse && (
        <form onSubmit={handleEditCourseSubmit}>
          <h3>Edit Course</h3>
          <div>
            <label>Title:</label>
            <input type="text" value={editCourseTitle} onChange={(e) => setEditCourseTitle(e.target.value)} required />
          </div>
          <div>
            <label>Description:</label>
            <textarea value={editCourseDescription} onChange={(e) => setEditCourseDescription(e.target.value)} />
          </div>
          <div>
            <label>Category:</label>
            <input type="text" value={editCourseCategory} onChange={(e) => setEditCourseCategory(e.target.value)} />
          </div>
          <div>
            <label>Link:</label>
            <input type="url" value={editCourseLink} onChange={(e) => setEditCourseLink(e.target.value)} required />
          </div>
          <div>
            <label>Price:</label>
            <input type="number" value={editCoursePrice} onChange={(e) => setEditCoursePrice(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label>Image URL:</label>
            <input type="url" value={editCourseImageUrl} onChange={(e) => setEditCourseImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
          </div>
          <button type="submit">Update Course</button>
          <button type="button" onClick={resetEditForm}>Cancel</button>
        </form>
      )}

      {isLoading && <p>Loading courses...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!isLoading && !error && courses.length === 0 && <p>No courses found.</p>}
      {!isLoading && !error && courses.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {courses.map((course) => (
            <li key={course._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              {course.imageUrl && <img src={course.imageUrl} alt={course.title} style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }} />}
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p><em>Category: {course.category}</em></p>
              {course.price !== undefined && <p><strong>Price: ${course.price.toFixed(2)}</strong></p>}
              <p><a href={course.link} target="_blank" rel="noopener noreferrer">Go to course</a></p>
              <p><small>Created by: {course.createdBy ? course.createdBy.name : 'Unknown'} ({course.createdBy ? course.createdBy.role : 'N/A'})</small></p>
              <p><small>Created at: {new Date(course.createdAt).toLocaleDateString()}</small></p>
              {token && canManageCourse(course) && (
                <div>
                  <button onClick={() => handleShowEditCourseForm(course)}>Edit</button>
                  <button onClick={() => handleDeleteCourse(course._id)}>Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Courses;