
import { useEffect, useState } from 'react';
import './App.css';

const STORAGE_KEY = 'my-properties';

const starterProperties = [
  {
    id: 1,
    title: 'Modern Family Home',
    location: 'Jamkhandi, Karnataka',
    price: '₹45,00,000',
    details: '3 Bedrooms · 2 Bathrooms',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
    ],
    phone: '+919876543210',
    published: true,
  },
  {
    id: 2,
    title: 'Beautiful City Apartment',
    location: 'Vijayapura, Karnataka',
    price: '₹32,00,000',
    details: '2 Bedrooms · 2 Bathrooms',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
    ],
    phone: '+919876543210',
    published: true,
  },
  {
    id: 3,
    title: 'Residential Plot',
    location: 'Bagalkot, Karnataka',
    price: '₹18,00,000',
    details: 'Residential land · Ready to build',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    ],
    phone: '+919876543210',
    published: true,
  },
];

const emptyForm = {
  title: '',
  location: '',
  price: '',
  details: '',
  images: [],
  phone: '',
};

function readSavedProperties() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? starterProperties : JSON.parse(saved);
  } catch {
    return starterProperties;
  }
}

function formatPriceNumber(price) {
  const digits = String(price ?? '').replace(/\D/g, '');
  return Number(digits) || 0;
}

function PropertyPhotos({ property }) {
  const photos =
    property.images?.length
      ? property.images
      : property.image
        ? [property.image]
        : [];

  return (
    <div className="property-photo-gallery">
      {photos.length > 0 ? (
        photos.map((photo, index) => (
          <img
            key={`${property.id}-${index}`}
            className="property-image"
            src={photo}
            alt={`${property.title} - photo ${index + 1}`}
            loading="lazy"
          />
        ))
      ) : (
        <div className="photo-placeholder">No photos available</div>
      )}
    </div>
  );
}

function App() {
  const [properties, setProperties] = useState(readSavedProperties);
  const [page, setPage] = useState(
  window.location.pathname === '/admin' ? 'login' : 'home'
);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    } catch (error) {
      console.error(error);
      setMessage(
        'Storage is full. Try removing photos or using smaller images.'
      );
    }
  }, [properties]);

  function saveProperties(updatedProperties) {
    setProperties(updatedProperties);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handlePhotoChange(event) {
    const files = Array.from(event.target.files || []);
    setForm((currentForm) => ({
      ...currentForm,
      images: files,
    }));
  }

  async function convertFilesToDataUrls(files) {
    return Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () =>
              reject(new Error('Could not read a photo.'));
            reader.readAsDataURL(file);
          })
      )
    );
  }

  function startEditingProperty(property) {
    setEditingPropertyId(property.id);
    setForm({
      title: property.title || '',
      location: property.location || '',
      price: property.price || '',
      details: property.details || '',
      images: [],
      phone: property.phone || '',
    });
    setFormKey((key) => key + 1);
    setMessage(`Editing: ${property.title}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEditing() {
    setEditingPropertyId(null);
    setForm(emptyForm);
    setFormKey((key) => key + 1);
    setMessage('');
  }

  async function addProperty(event) {
    event.preventDefault();
    setMessage('Saving property...');

    try {
      const uploadedImages = await convertFilesToDataUrls(form.images);
      const existingProperty = properties.find(
        (property) => property.id === editingPropertyId
      );

      const oldImages = existingProperty
        ? existingProperty.images?.length
          ? existingProperty.images
          : existingProperty.image
            ? [existingProperty.image]
            : []
        : [];

      const savedImages = uploadedImages.length
        ? uploadedImages
        : oldImages;

      const updatedProperty = {
        title: form.title.trim(),
        location: form.location.trim(),
        price: form.price.trim(),
        details: form.details.trim(),
        phone: form.phone.trim(),
        id: existingProperty ? existingProperty.id : Date.now(),
        published: existingProperty
          ? existingProperty.published
          : true,
        images: savedImages,
        image: savedImages[0] || '',
      };

      const updatedProperties = existingProperty
        ? properties.map((property) =>
            property.id === existingProperty.id
              ? updatedProperty
              : property
          )
        : [...properties, updatedProperty];

      saveProperties(updatedProperties);
      setForm(emptyForm);
      setEditingPropertyId(null);
      setFormKey((key) => key + 1);
      setMessage(
        existingProperty
          ? 'Property updated successfully!'
          : 'Property added successfully!'
      );
    } catch (error) {
      console.error(error);
      setMessage(
        'Could not save the property. Try smaller photos.'
      );
    }
  }

  function togglePublished(id) {
    saveProperties(
      properties.map((property) =>
        property.id === id
          ? { ...property, published: !property.published }
          : property
      )
    );
    setMessage('Property visibility updated.');
  }

  function deleteProperty(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this property?'
    );

    if (!confirmed) return;

    saveProperties(
      properties.filter((property) => property.id !== id)
    );

    if (editingPropertyId === id) {
      cancelEditing();
    }

    setMessage('Property deleted.');
  }

  function handleLogin(event) {
    event.preventDefault();

    if (
      loginUsername === 'admin' &&
      loginPassword === 'Estate@123'
    ) {
      setIsAdminLoggedIn(true);
      setPage('admin');
      setLoginError('');
      setLoginPassword('');
      setMessage('');
    } else {
      setLoginError('Incorrect username or password.');
    }
  }

  function openAdmin() {
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
    setPage(isAdminLoggedIn ? 'admin' : 'login');
  }

  function goHome() {
    setPage('home');
    setMessage('');
  }

  function logout() {
    setIsAdminLoggedIn(false);
    setPage('home');
    cancelEditing();
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
    setMessage('');
  }

  const visibleProperties = properties.filter((property) => {
    const query = searchTerm.trim().toLowerCase();
    const searchableText =
      `${property.title || ''} ${property.location || ''} ${property.details || ''}`.toLowerCase();

    const price = formatPriceNumber(property.price);
    const aboveMinimum =
      minPrice === '' || price >= Number(minPrice);
    const belowMaximum =
      maxPrice === '' || price <= Number(maxPrice);

    return (
      property.published &&
      searchableText.includes(query) &&
      aboveMinimum &&
      belowMaximum
    );
  });

  if (page === 'login') {
    return (
      <div className="app-shell">
        <header className="site-header">
          <button className="brand" onClick={goHome}>
            <span className="brand-mark">A</span>
            <span>ApnaEstate</span>
          </button>
          <button className="secondary-button" onClick={goHome}>
            Back to website
          </button>
        </header>

        <main className="login-page">
          <section className="login-card">
            <p className="eyebrow">ADMINISTRATION</p>
            <h1>Admin Login</h1>
            <p className="muted-text">
              Sign in to manage your property listings.
            </p>

            <form className="property-form" onSubmit={handleLogin}>
              <label>
                Username
                <input
                  value={loginUsername}
                  onChange={(event) =>
                    setLoginUsername(event.target.value)
                  }
                  autoComplete="username"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) =>
                    setLoginPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                />
              </label>

              {loginError && (
                <p className="error-message">{loginError}</p>
              )}

              <button className="call-button submit-button" type="submit">
                Sign In
              </button>
            </form>

            <p className="muted-text login-note">
              Demo username: admin · Password: Estate@123
            </p>
          </section>
        </main>
      </div>
    );
  }

  if (page === 'admin' && isAdminLoggedIn) {
    return (
      <div className="app-shell">
        <header className="site-header">
          <button className="brand" onClick={goHome}>
            <span className="brand-mark">A</span>
            <span>ApnaEstate</span>
          </button>

          <div className="header-actions">
            <span className="admin-label">Admin Dashboard</span>
            <button className="secondary-button" onClick={goHome}>
              Buyer View
            </button>
            <button className="secondary-button" onClick={logout}>
              Log Out
            </button>
          </div>
        </header>

        <main className="page-container">
          <section className="admin-welcome">
            <p className="eyebrow">PROPERTY MANAGEMENT</p>
            <h1>Manage your properties</h1>
            <p className="muted-text">
              Add new listings or edit, publish, hide and delete existing ones.
            </p>
          </section>

          <section className="admin-layout">
            <div className="admin-form-panel">
              <h2>
                {editingPropertyId !== null
                  ? 'Edit Property'
                  : 'Add a Property'}
              </h2>

              <form
                key={formKey}
                className="property-form"
                onSubmit={addProperty}
              >
                <label>
                  Property Name *
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Example: 2 BHK Apartment"
                    required
                  />
                </label>

                <label>
                  Location *
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City, State"
                    required
                  />
                </label>

                <label>
                  Price *
                  <input
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Example: ₹45,00,000"
                    required
                  />
                </label>

                <label>
                  Property Details *
                  <textarea
                    name="details"
                    value={form.details}
                    onChange={handleChange}
                    placeholder="Bedrooms, bathrooms, plot size..."
                    rows={4}
                    required
                  />
                </label>

                <label>
                  Property Photos
                  <input
                    name="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    required={editingPropertyId === null}
                  />
                  <small>
                    Select one or more photos. When editing, leave this
                    empty to keep existing photos.
                  </small>
                </label>

                <label>
                  Call Phone Number *
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Example: +919876543210"
                    required
                  />
                </label>

                <button
                  className="call-button submit-button"
                  type="submit"
                >
                  {editingPropertyId !== null
                    ? 'Save Changes'
                    : '+ Add Property'}
                </button>

                {editingPropertyId !== null && (
                  <button
                    className="secondary-button full-width-button"
                    type="button"
                    onClick={cancelEditing}
                  >
                    Cancel Editing
                  </button>
                )}

                {message && (
                  <p className="status-message" role="status">
                    {message}
                  </p>
                )}
              </form>
            </div>

            <div className="admin-list-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">YOUR INVENTORY</p>
                  <h2>All Properties</h2>
                </div>
                <span className="count-badge">
                  {properties.length}
                </span>
              </div>

              {properties.length === 0 ? (
                <p className="empty-state">
                  No properties yet. Add your first property using the form.
                </p>
              ) : (
                <div className="admin-property-list">
                  {properties.map((property) => (
                    <article
                      className="admin-property-card"
                      key={property.id}
                    >
                      <PropertyPhotos property={property} />

                      <div className="property-info">
                        <span
                          className={
                            property.published
                              ? 'status-pill published'
                              : 'status-pill hidden'
                          }
                        >
                          {property.published ? 'Published' : 'Hidden'}
                        </span>

                        <h3>{property.title}</h3>
                        <p className="property-location">
                          {property.location}
                        </p>
                        <p className="property-price">{property.price}</p>

                        <div className="manage-actions">
                          <button
                            className="secondary-button"
                            onClick={() =>
                              startEditingProperty(property)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="secondary-button"
                            onClick={() =>
                              togglePublished(property.id)
                            }
                          >
                            {property.published ? 'Hide' : 'Publish'}
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => deleteProperty(property.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={goHome}>
          <span className="brand-mark">A</span>
          <span>ApnaEstate</span>
        </button>

        
<nav className="header-actions">
  <a href="#properties" className="nav-link">
    Properties
  </a>
</nav>
</header>


      <main>
        <section className="hero-section">
          <div className="hero-content">
            <p className="eyebrow">FIND YOUR PLACE</p>
            <h1>Find a place you'll love to call home.</h1>
            <p>
              Explore homes, apartments and land for sale across your
              favourite locations.
            </p>
            <a className="call-button hero-button" href="#properties">
              Explore Properties
            </a>
          </div>
        </section>

        <section className="listings page-container" id="properties">
          <div className="section-heading">
            <div>
              <p className="eyebrow">OUR COLLECTION</p>
              <h2>Featured Properties</h2>
              <p className="muted-text">
                Find a property that fits your needs and budget.
              </p>
            </div>
            <span className="count-badge">
              {visibleProperties.length} found
            </span>
          </div>

          <div className="search-filters">
            <input
              className="property-search"
              type="search"
              placeholder="Search by property name or location..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search properties"
            />

            <input
              className="filter-input"
              type="number"
              min="0"
              placeholder="Minimum price (₹)"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              aria-label="Minimum price in rupees"
            />

            <input
              className="filter-input"
              type="number"
              min="0"
              placeholder="Maximum price (₹)"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              aria-label="Maximum price in rupees"
            />

            <button
              className="secondary-button"
              onClick={() => {
                setSearchTerm('');
                setMinPrice('');
                setMaxPrice('');
              }}
            >
              Clear Filters
            </button>
          </div>

          {visibleProperties.length === 0 ? (
            <div className="empty-state">
              <h3>No matching properties</h3>
              <p>Try another location or adjust your price range.</p>
            </div>
          ) : (
            <div className="property-grid">
              {visibleProperties.map((property) => (
                <article className="property-card" key={property.id}>
                  <PropertyPhotos property={property} />

                  <div className="property-info">
                    <p className="property-location">
                      {property.location}
                    </p>
                    <h3>{property.title}</h3>
                    <p className="property-details">
                      {property.details}
                    </p>
                    <p className="property-price">{property.price}</p>

                    <a
                      className="call-button"
                      href={`tel:${property.phone}`}
                    >
                      ☎ Call Now
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <span>ApnaEstate</span>
        <p>Find your place. Begin your next chapter.</p>
      </footer>
    </div>
  );
}

export default App;
