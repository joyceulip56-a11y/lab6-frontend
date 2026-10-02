import { useEffect, useState } from 'react'

const API_URL = 'https://ulip-joyce-lavalustt.onrender.com'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [products, setProducts] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    product_name: '',
    description: '',
    price: '',
    quantity: ''
  })

  const fetchProducts = async (authToken = token) => {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setProducts(Array.isArray(data) ? data : data.products || [])
        setMessage('')
      } else {
        setMessage(data.message || data.error || 'Failed to load products.')
      }
    } catch (error) {
      setMessage('Unable to connect to the server.')
      console.error(error)
    }
  }

  useEffect(() => {
    if (token) {
      fetchProducts(token)
    }
  }, [token])

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok && data.access_token) {
        localStorage.setItem('token', data.access_token)
        setToken(data.access_token)
        setMessage('')
      } else {
        setMessage(data.message || data.error || 'Login failed.')
      }
    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken('')
    setProducts([])
    setUsername('')
    setPassword('')
    setMessage('')
    resetForm()
  }

  const resetForm = () => {
    setForm({
      product_name: '',
      description: '',
      price: '',
      quantity: ''
    })
    setEditingId(null)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    const isEditing = editingId !== null

    const url = isEditing
      ? `${API_URL}/api/products/${editingId}`
      : `${API_URL}/api/products`

    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          quantity: Number(form.quantity)
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(
          isEditing
            ? 'Product updated successfully.'
            : 'Product added successfully.'
        )

        resetForm()
        await fetchProducts()
      } else {
        setMessage(
          data.message ||
            data.error ||
            'Unable to save product.'
        )
      }
    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to the server.')
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)

    setForm({
      product_name: product.product_name || '',
      description: product.description || '',
      price: product.price ?? '',
      quantity: product.quantity ?? ''
    })

    setMessage('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this product?'
      )
    ) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (response.ok) {
        setMessage('Product deleted successfully.')
        await fetchProducts()
      } else {
        setMessage(
          data.message ||
            data.error ||
            'Unable to delete product.'
        )
      }
    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to the server.')
    }
  }

  /* =========================
     LOGIN PAGE
  ========================= */

  if (!token) {
    return (
      <div style={styles.loginPage}>

        <div style={styles.loginBackgroundCircleOne}></div>
        <div style={styles.loginBackgroundCircleTwo}></div>

        <div style={styles.loginCard}>

          <div style={styles.loginIcon}>
            🛍️
          </div>

          <h1 style={styles.loginTitle}>
            Product Management
          </h1>

          <p style={styles.loginSubtitle}>
            Welcome back! Please login to continue.
          </p>

          <form onSubmit={handleLogin}>

            <label style={styles.label}>
              Username
            </label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                👤
              </span>

              <input
                style={styles.loginInput}
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />
            </div>

            <label style={styles.label}>
              Password
            </label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                🔒
              </span>

              <input
                style={styles.loginInput}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            <button
              style={styles.loginButton}
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Logging in...'
                : 'Login'}
            </button>

          </form>

          {message && (
            <div style={styles.errorMessage}>
              {message}
            </div>
          )}

        </div>
      </div>
    )
  }

  /* =========================
     MAIN PRODUCT MANAGEMENT
  ========================= */

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        {/* HEADER */}

        <header style={styles.header}>

          <div>
            <p style={styles.smallTitle}>
              ADMIN DASHBOARD
            </p>

            <h1 style={styles.heading}>
              Product Management
            </h1>

            <p style={styles.headerSubtitle}>
              Manage your products easily and efficiently.
            </p>
          </div>

          <button
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </header>

        {/* MESSAGE */}

        {message && (
          <div style={styles.successMessage}>
            <span>✓</span>
            {message}
          </div>
        )}

        {/* ADD / EDIT PRODUCT */}

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div style={styles.cardIcon}>
              {editingId !== null ? '✏️' : '➕'}
            </div>

            <div>
              <h2 style={styles.cardTitle}>
                {editingId !== null
                  ? 'Edit Product'
                  : 'Add New Product'}
              </h2>

              <p style={styles.cardDescription}>
                {editingId !== null
                  ? 'Update the product information below.'
                  : 'Enter the details of your new product.'}
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div style={styles.formGrid}>

              {/* PRODUCT NAME */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Product Name
                </label>

                <input
                  style={styles.input}
                  type="text"
                  name="product_name"
                  placeholder="Enter product name"
                  value={form.product_name}
                  onChange={handleFormChange}
                  required
                />

              </div>

              {/* PRICE */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Price
                </label>

                <div style={styles.priceWrapper}>

                  <span style={styles.currency}>
                    ₱
                  </span>

                  <input
                    style={styles.priceInput}
                    type="number"
                    name="price"
                    placeholder="0.00"
                    value={form.price}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

              </div>

              {/* QUANTITY */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Quantity
                </label>

                <input
                  style={styles.input}
                  type="number"
                  name="quantity"
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChange={handleFormChange}
                  min="0"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div
                style={{
                  ...styles.formGroup,
                  gridColumn: '1 / -1'
                }}
              >

                <label style={styles.label}>
                  Description
                </label>

                <textarea
                  style={styles.textarea}
                  name="description"
                  placeholder="Enter product description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows="4"
                  required
                />

              </div>

            </div>

            <div style={styles.formButtons}>

              <button
                style={styles.primaryButton}
                type="submit"
              >
                <span>
                  {editingId !== null
                    ? '✓'
                    : '+'}
                </span>

                {editingId !== null
                  ? 'Update Product'
                  : 'Add Product'}
              </button>

              {editingId !== null && (
                <button
                  style={styles.cancelButton}
                  type="button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>

        {/* PRODUCT LIST */}

        <section style={styles.card}>

          <div style={styles.productListHeader}>

            <div>

              <p style={styles.smallTitle}>
                INVENTORY
              </p>

              <h2 style={styles.cardTitle}>
                Product List
              </h2>

              <p style={styles.cardDescription}>
                View and manage all your products.
              </p>

            </div>

            <div style={styles.productCount}>
              <span style={styles.countNumber}>
                {products.length}
              </span>

              <span style={styles.countText}>
                Products
              </span>
            </div>

          </div>

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    ID
                  </th>

                  <th style={styles.th}>
                    Product
                  </th>

                  <th style={styles.th}>
                    Description
                  </th>

                  <th style={styles.th}>
                    Price
                  </th>

                  <th style={styles.th}>
                    Quantity
                  </th>

                  <th style={styles.th}>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {products.length > 0 ? (

                  products.map((product) => (

                    <tr
                      key={product.id}
                      style={styles.tableRow}
                    >

                      <td style={styles.td}>
                        <span style={styles.idBadge}>
                          #{product.id}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <strong style={styles.productName}>
                          {product.product_name}
                        </strong>
                      </td>

                      <td style={styles.descriptionCell}>
                        {product.description}
                      </td>

                      <td style={styles.td}>
                        <strong style={styles.priceText}>
                          ₱
                          {Number(
                            product.price
                          ).toFixed(2)}
                        </strong>
                      </td>

                      <td style={styles.td}>
                        <span style={styles.quantityBadge}>
                          {product.quantity}
                        </span>
                      </td>

                      <td style={styles.td}>

                        <div style={styles.actionButtons}>

                          <button
                            style={styles.editButton}
                            onClick={() =>
                              handleEdit(product)
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            style={styles.deleteButton}
                            onClick={() =>
                              handleDelete(product.id)
                            }
                          >
                            🗑 Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      style={styles.emptyCell}
                      colSpan="6"
                    >

                      <div style={styles.emptyIcon}>
                        📦
                      </div>

                      <strong>
                        No products found
                      </strong>

                      <p style={styles.emptyText}>
                        Add your first product using
                        the form above.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* FOOTER */}

        <footer style={styles.footer}>
          <span>Product Management System</span>
          <span>•</span>
          <span>Manage your inventory with ease.</span>
        </footer>

      </div>

    </div>
  )
}

/* =========================================
   STYLES
========================================= */

const styles = {

  page: {
    minHeight: '100vh',
    background:
      'linear-gradient(135deg, #fff1f7 0%, #fce7f3 45%, #fff7fa 100%)',
    padding: '35px 20px',
    fontFamily:
      'Inter, Arial, Helvetica, sans-serif',
    boxSizing: 'border-box',
    color: '#4a1830'
  },

  container: {
    maxWidth: '1180px',
    margin: '0 auto'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '28px',
    padding: '10px 4px',
    flexWrap: 'wrap'
  },

  smallTitle: {
    margin: '0 0 5px',
    color: '#ec4899',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '1.5px'
  },

  heading: {
    fontSize: '34px',
    color: '#831843',
    margin: '0 0 5px',
    fontWeight: '800',
    letterSpacing: '-0.8px'
  },

  headerSubtitle: {
    margin: 0,
    color: '#9d5b78',
    fontSize: '14px'
  },

  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background:
      'linear-gradient(135deg, #db2777, #be185d)',
    color: '#fff',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow:
      '0 8px 20px rgba(219, 39, 119, 0.25)'
  },

  card: {
    background: 'rgba(255, 255, 255, 0.96)',
    padding: '30px',
    borderRadius: '18px',
    marginBottom: '25px',
    border: '1px solid #f9a8d4',
    boxShadow:
      '0 12px 35px rgba(157, 23, 77, 0.10)',
    boxSizing: 'border-box'
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '28px'
  },

  cardIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background:
      'linear-gradient(135deg, #fce7f3, #f5a8cc)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '21px',
    flexShrink: 0
  },

  cardTitle: {
    fontSize: '23px',
    color: '#701a43',
    margin: 0,
    fontWeight: '750'
  },

  cardDescription: {
    margin: '5px 0 0',
    color: '#9d6680',
    fontSize: '13px'
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '20px'
  },

  formGroup: {
    width: '100%'
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '700',
    color: '#9d174d',
    fontSize: '14px'
  },

  input: {
    display: 'block',
    width: '100%',
    padding: '13px 15px',
    border: '1px solid #f5a8cc',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    background: '#fff7fb',
    color: '#701a43'
  },

  textarea: {
    display: 'block',
    width: '100%',
    padding: '13px 15px',
    border: '1px solid #f5a8cc',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    background: '#fff7fb',
    color: '#701a43',
    resize: 'vertical',
    fontFamily:
      'Inter, Arial, Helvetica, sans-serif'
  },

  priceWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    background: '#fff7fb',
    border: '1px solid #f5a8cc',
    borderRadius: '10px',
    overflow: 'hidden',
    boxSizing: 'border-box'
  },

  currency: {
    padding: '0 0 0 15px',
    color: '#db2777',
    fontWeight: '800',
    fontSize: '15px'
  },

  priceInput: {
    width: '100%',
    padding: '13px 15px 13px 7px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    background: 'transparent',
    color: '#701a43',
    boxSizing: 'border-box'
  },

  formButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '24px'
  },

  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background:
      'linear-gradient(135deg, #ec4899, #be185d)',
    color: '#fff',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow:
      '0 7px 18px rgba(219, 39, 119, 0.25)'
  },

  cancelButton: {
    background: '#fdf2f8',
    color: '#6b4557',
    padding: '12px 20px',
    border: '1px solid #e5b5cc',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700'
  },

  productListHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '25px',
    flexWrap: 'wrap'
  },

  productCount: {
    minWidth: '105px',
    padding: '13px 18px',
    borderRadius: '12px',
    background: '#fff1f7',
    border: '1px solid #f5a8cc',
    textAlign: 'center'
  },

  countNumber: {
    display: 'block',
    color: '#be185d',
    fontSize: '23px',
    fontWeight: '800'
  },

  countText: {
    display: 'block',
    color: '#ec4899',
    fontSize: '11px',
    fontWeight: '700',
    marginTop: '2px'
  },

  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid #f9a8d4',
    borderRadius: '12px'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '850px',
    background: '#fff'
  },

  th: {
    background:
      'linear-gradient(135deg, #db2777, #be185d)',
    color: '#fff',
    textAlign: 'left',
    padding: '15px 14px',
    fontSize: '13px',
    fontWeight: '700',
    borderBottom: 'none'
  },

  td: {
    padding: '16px 14px',
    borderBottom: '1px solid #fce7f3',
    color: '#674052',
    fontSize: '14px',
    verticalAlign: 'middle'
  },

  descriptionCell: {
    padding: '16px 14px',
    borderBottom: '1px solid #fce7f3',
    color: '#8b6478',
    fontSize: '13px',
    lineHeight: '1.5',
    maxWidth: '330px',
    verticalAlign: 'middle'
  },

  idBadge: {
    display: 'inline-block',
    padding: '5px 9px',
    borderRadius: '7px',
    background: '#fce7f3',
    color: '#be185d',
    fontSize: '12px',
    fontWeight: '800'
  },

  productName: {
    color: '#701a43',
    fontSize: '14px'
  },

  priceText: {
    color: '#db2777',
    fontSize: '14px'
  },

  quantityBadge: {
    display: 'inline-block',
    minWidth: '28px',
    padding: '5px 8px',
    borderRadius: '7px',
    background: '#fce7f3',
    color: '#9d174d',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: '12px'
  },

  actionButtons: {
    display: 'flex',
    gap: '7px',
    flexWrap: 'wrap'
  },

  editButton: {
    background: '#ec4899',
    color: '#fff',
    padding: '8px 11px',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700'
  },

  deleteButton: {
    background: '#e11d48',
    color: '#fff',
    padding: '8px 11px',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700'
  },

  emptyCell: {
    padding: '50px 20px',
    textAlign: 'center',
    color: '#be185d',
    fontSize: '15px'
  },

  emptyIcon: {
    fontSize: '38px',
    marginBottom: '10px'
  },

  emptyText: {
    color: '#9d6680',
    fontSize: '13px',
    marginTop: '7px'
  },

  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    background: '#fdf2f8',
    color: '#9d174d',
    border: '1px solid #f9a8d4',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '13px',
    fontWeight: '600'
  },

  loginPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    background:
      'linear-gradient(135deg, #831843 0%, #9d174d 50%, #db2777 100%)',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily:
      'Inter, Arial, Helvetica, sans-serif'
  },

  loginBackgroundCircleOne: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    top: '-160px',
    right: '-100px'
  },

  loginBackgroundCircleTwo: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    bottom: '-150px',
    left: '-100px'
  },

  loginCard: {
    width: '100%',
    maxWidth: '430px',
    padding: '40px',
    background: 'rgba(255,255,255,0.98)',
    borderRadius: '22px',
    boxShadow:
      '0 25px 60px rgba(80,20,50,0.20)',
    position: 'relative',
    zIndex: 2,
    boxSizing: 'border-box'
  },

  loginIcon: {
    width: '65px',
    height: '65px',
    margin: '0 auto 18px',
    borderRadius: '18px',
    background:
      'linear-gradient(135deg, #ec4899, #be185d)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    boxShadow:
      '0 10px 25px rgba(219,39,119,0.3)'
  },

  loginTitle: {
    textAlign: 'center',
    color: '#701a43',
    fontSize: '27px',
    margin: '0 0 8px',
    fontWeight: '800'
  },

  loginSubtitle: {
    textAlign: 'center',
    color: '#9d6680',
    fontSize: '13px',
    margin: '0 0 28px'
  },

  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #f5a8cc',
    borderRadius: '10px',
    background: '#fff7fb',
    marginBottom: '18px',
    overflow: 'hidden'
  },

  inputIcon: {
    paddingLeft: '14px',
    fontSize: '16px'
  },

  loginInput: {
    width: '100%',
    padding: '13px 14px',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14px',
    color: '#701a43',
    boxSizing: 'border-box'
  },

  loginButton: {
    width: '100%',
    padding: '14px',
    marginTop: '5px',
    border: 'none',
    borderRadius: '10px',
    background:
      'linear-gradient(135deg, #ec4899, #be185d)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow:
      '0 9px 20px rgba(219,39,119,0.3)'
  },

  errorMessage: {
    marginTop: '18px',
    padding: '11px 13px',
    borderRadius: '9px',
    background: '#fff1f2',
    color: '#be123c',
    border: '1px solid #fda4af',
    fontSize: '13px',
    textAlign: 'center'
  },

  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '9px',
    flexWrap: 'wrap',
    color: '#9d6680',
    fontSize: '12px',
    padding: '5px 0 20px'
  }
}

export default App