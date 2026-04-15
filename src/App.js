import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, ShoppingCart, Users, Eye, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'https://api.tabledesrois.site'; // Ajustez selon votre configuration
// const API_BASE_URL = "http://localhost:8000";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [disableLoadingId, setDisableLoadingId] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockEntries, setStockEntries] = useState([]);
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockLoading, setStockLoading] = useState(false);
  const [stockEntriesLoading, setStockEntriesLoading] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportLoading, setExportLoading] = useState('');
  const [exportDeliveryStatus, setExportDeliveryStatus] = useState('delivered');

  const [editingCategory, setEditingCategory] = useState(null); // catégorie en cours d'édition
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editedCategoryImage, setEditedCategoryImage] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null); // produit en cours de modification
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [editedProductForm, setEditedProductForm] = useState({
    name: '',
    description: '',
    category_id: '',
    amount: '',
    in_stock: '',
    image: null
  });

  // États pour les modales
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // États pour les formulaires
  const [categoryForm, setCategoryForm] = useState({ name: '', image: null });
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category_id: '',
    amount: '',
    in_stock: '',
    image: null
  });

  // Chargement des données
  useEffect(() => {
    loadCategories();
    loadProducts();
    loadOrders();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
    }
  };

  const toggleProductDisabled = async (product) => {
    setDisableLoadingId(product.id);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${product.id}/disabled`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ disabled: !product.disabled })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise a jour');
      }

      await loadProducts();
      setError('');
    } catch (err) {
      setError('Erreur lors de la mise a jour: ' + err.message);
    } finally {
      setDisableLoadingId(null);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError('Erreur lors du chargement des commandes');
    }
  };

  const loadStockEntries = async (productId) => {
    setStockEntriesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/stock-entries?product_id=${productId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du stock');
      }
      const data = await response.json();
      setStockEntries(data);
    } catch (err) {
      setError('Erreur lors du chargement du stock: ' + err.message);
    } finally {
      setStockEntriesLoading(false);
    }
  };

  const openStockModal = async (product) => {
    setStockProduct(product);
    setStockQuantity('');
    await loadStockEntries(product.id);
  };

  const handleCreateStockEntry = async () => {
    if (!stockProduct) {
      return;
    }
    const quantityNumber = Number(stockQuantity);
    if (!quantityNumber || quantityNumber <= 0) {
      setError('La quantite doit etre superieure a 0');
      return;
    }

    setStockLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/stock-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          product_id: stockProduct.id,
          quantity: quantityNumber
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erreur lors de la mise a jour');
      }

      await loadStockEntries(stockProduct.id);
      await loadProducts();
      setStockQuantity('');
      setError('');
    } catch (err) {
      setError('Erreur lors de la mise a jour: ' + err.message);
    } finally {
      setStockLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, delivered) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ delivered })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Recharger les commandes après la mise à jour
      await loadOrders();
      setError('');
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut: ' + err.message);
    }
  };

  const getOrderStockIssues = (order) => {
    if (!order?.items?.length) {
      return [];
    }

    const stockByProductId = new Map(
      products.map((product) => [product.id, Number(product.in_stock || 0)])
    );

    return order.items
      .map((item) => {
        const productId = item.product?.id;
        const available = stockByProductId.get(productId) ?? 0;
        const required = Number(item.quantity || 0);
        const missing = required - available;
        if (missing > 0) {
          return {
            name: item.product?.name || `Produit ${productId}`,
            missing
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const downloadOrdersExport = async (exportType) => {
    if (exportStartDate && exportEndDate && exportStartDate > exportEndDate) {
      setError("La date de debut doit etre avant la date de fin");
      return;
    }

    setExportLoading(exportType);
    try {
      const params = new URLSearchParams({
        export_type: exportType,
        delivery_status: exportDeliveryStatus
      });
      if (exportStartDate) {
        params.append('start_date', exportStartDate);
      }
      if (exportEndDate) {
        params.append('end_date', exportEndDate);
      }

      const response = await fetch(`${API_BASE_URL}/orders/export-excel?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'exportation");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportType === 'lines'
        ? 'export_commandes_lignes.xlsx'
        : 'export_commandes_produits.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setError('');
    } catch (err) {
      setError("Erreur lors de l'exportation: " + err.message);
    } finally {
      setExportLoading('');
    }
  };

  // Gestion des catégories
const handleCreateCategory = async () => {
    setLoading(true);
    try {
      if (!categoryForm.name || !categoryForm.name.trim()) {
        setError('Le nom de la catégorie est requis');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('name', categoryForm.name.trim());
      if (categoryForm.image) {
        formData.append('image', categoryForm.image);
      }

      // Debug log
      console.log('Sending category FormData:', Object.fromEntries(formData));

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        mode: 'cors',
        body: formData
      });
      
      if (response.ok) {
        await loadCategories();
        setShowCategoryModal(false);
        setCategoryForm({ name: '', image: null });
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Erreur lors de la création');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
    setLoading(false);
  };

  // Gestion des produits
  const handleCreateProduct = async () => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('category_id', productForm.category_id);
    formData.append('amount', productForm.amount);
    if (productForm.in_stock !== '' && productForm.in_stock !== null) {
      formData.append('in_stock', productForm.in_stock);
    }
    if (productForm.image) {
      formData.append('image', productForm.image);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        mode: "cors",
        body: formData
      });
      
      if (response.ok) {
        await loadProducts();
        await loadCategories();
        setShowProductModal(false);
        setProductForm({ name: '', description: '', category_id: '', amount: '', in_stock: '', image: null });
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Erreur lors de la création');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await loadCategories();
      } else {
        setError('Erreur lors de la suppression de la catégorie');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await loadProducts();
      } else {
        setError('Erreur lors de la suppression du produit');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  const handleUpdateCategory = async (categoryId, updatedName, updatedImage) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', updatedName);
      if (updatedImage) {
        formData.append('image', updatedImage);
      }

      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'PUT',
        mode: 'cors',
        body: formData,
      });

      if (response.ok) {
        await loadCategories();
        setError('');
      } else {
        const errorData = await response.json();

        // Gérer les erreurs de validation de FastAPI (listes d'erreurs)
        const message = Array.isArray(errorData.detail)
          ? errorData.detail.map((e) => e.msg).join(', ')
          : errorData.detail || 'Erreur lors de la mise à jour';

        setError(message);
      }
    } catch (err) {
      setError("Erreur de connexion");
    }
    setLoading(false);
  };

  // Composants de l'interface
  const Dashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Catégories</p>
            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
          </div>
          <div className="bg-blue-500 rounded-full p-3">
            <Users className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Produits</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-green-500 rounded-full p-3">
            <Package className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Commandes</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-purple-500 rounded-full p-3">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  const CategoriesTab = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Gestion des Catégories</h2>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Catégorie
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre de produits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.image_url ? (
                      <img
                        src={`${API_BASE_URL}${category.image_url}`}
                        alt={category.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">Aucune</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.product_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => {
                        setEditingCategory(category);
                        setEditedCategoryName(category.name);
                        setEditedCategoryImage(null);
                      }}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProductsTab = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Gestion des Produits</h2>
          <button
            onClick={() => setShowProductModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau Produit
          </button>
        </div>
        <div className="mt-4 max-w-md">
          <input
            type="text"
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products
            .filter((product) => {
              const query = productSearchQuery.trim().toLowerCase();
              if (!query) {
                return true;
              }
              const name = (product.name || '').toLowerCase();
              const description = (product.description || '').toLowerCase();
              return name.includes(query) || description.includes(query);
            })
            .map((product) => (
            <div
              key={product.id}
              className={`border border-gray-200 rounded-lg p-4 ${product.disabled ? 'opacity-60' : ''}`}
            >
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 mb-4">
                <img
                  src={`${API_BASE_URL}${product.image_url}`}
                  alt={product.name}
                  className="h-48 w-full object-cover object-center"
                />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-lime-500">{product.name}</h3>
                {product.disabled && (
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                    Desactive
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{product.description}</p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-green-600">
                    {product.amount ? `${product.amount} FCFA` : 'Prix non défini'}
                  </span>
                  <p className="text-xs text-gray-500">
                    Stock: {product.in_stock ?? 0}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => {
                      setEditingProduct(product);
                      setEditedProductForm({
                        name: product.name,
                        description: product.description,
                        category_id: product.category.id,
                        amount: product.amount,
                        in_stock: product.in_stock ?? '',
                        image: null
                      });
                    }}>
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openStockModal(product)}
                    className="text-gray-700 hover:text-gray-900"
                    title="Entrees en stock"
                    aria-label={`Entrees en stock pour ${product.name}`}
                  >
                    Stock
                  </button>
                  <button
                    onClick={() => toggleProductDisabled(product)}
                    disabled={disableLoadingId === product.id}
                    className={`${product.disabled ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'} ${disableLoadingId === product.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={product.disabled ? 'Activer le produit' : 'Desactiver le produit'}
                    aria-label={product.disabled ? `Activer le produit ${product.name}` : `Desactiver le produit ${product.name}`}
                  >
                    {product.disabled ? 'Activer' : 'Desactiver'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const OrdersTab = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Gestion des Commandes</h2>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date debut</label>
            <input
              type="date"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={exportDeliveryStatus}
              onChange={(e) => setExportDeliveryStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="delivered">Deja livrees</option>
              <option value="pending">Non livrees</option>
              <option value="all">Toutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
            <input
              type="date"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => downloadOrdersExport('lines')}
              disabled={exportLoading === 'lines'}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {exportLoading === 'lines' ? 'Exportation...' : 'Exporter lignes'}
            </button>
            <button
              type="button"
              onClick={() => downloadOrdersExport('products')}
              disabled={exportLoading === 'products'}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {exportLoading === 'products' ? 'Exportation...' : 'Exporter produits'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode de récupération
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.phone_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.day} - {order.time_slot}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.delivery_method === 'self' ? "Client" : "Livraison"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.total_amount} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.delivred 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.delivred ? 'Livrée' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => setSelectedOrder(order)}
                      aria-label={`Voir la commande ${order.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {!order.delivred && (
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={() => {
                          const issues = getOrderStockIssues(order);
                          if (issues.length > 0) {
                            const details = issues
                              .map((issue) => `${issue.name}: manque ${issue.missing}`)
                              .join(' | ');
                            setError(`Stock insuffisant pour valider la commande #${order.id}. ${details}`);
                            return;
                          }
                          updateOrderStatus(order.id, true);
                        }}
                        title="Marquer comme livrée"
                        aria-label={`Marquer la commande ${order.id} comme livrée`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Table des Rois - Administration</h1>
            </div>
            <div>
              <Link to="/privacy-policy" className="text-blue-600 hover:underline text-sm">Politique de confidentialité</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: Users },
              { id: 'categories', label: 'Catégories', icon: Users },
              { id: 'products', label: 'Produits', icon: Package },
              { id: 'orders', label: 'Commandes', icon: ShoppingCart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              onClick={() => setError('')}
              className="float-right font-bold text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'products' && renderProductsTab()}
        {activeTab === 'orders' && <OrdersTab />}
      </main>

      {/* Modales */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nouvelle Catégorie</h3>
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de la catégorie (optionnel)
                </label>
<input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nouveau Produit</h3>
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du produit
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (FCFA)
                </label>
                <input
                  type="number"
                  value={productForm.amount}
                  onChange={(e) => setProductForm({ ...productForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock (optionnel)
                </label>
                <input
                  type="number"
                  min="0"
                  value={productForm.in_stock}
                  onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateProduct}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Modifier la Catégorie</h3>
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={editedCategoryName}
                  onChange={(e) => setEditedCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image (optionnel)</label>
                {editingCategory?.image_url && !editedCategoryImage && (
                  <img
                    src={`${API_BASE_URL}${editingCategory.image_url}`}
                    alt={editingCategory.name}
                    className="h-16 w-16 rounded object-cover mb-2"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditedCategoryImage(e.target.files?.[0] || null)}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    await handleUpdateCategory(editingCategory.id, editedCategoryName, editedCategoryImage);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Modifier le Produit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  value={editedProductForm.name}
                  onChange={(e) => setEditedProductForm({ ...editedProductForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editedProductForm.description}
                  onChange={(e) => setEditedProductForm({ ...editedProductForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                <select
                  value={editedProductForm.category_id}
                  onChange={(e) => setEditedProductForm({ ...editedProductForm, category_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Prix</label>
                <input
                  type="number"
                  value={editedProductForm.amount}
                  onChange={(e) => setEditedProductForm({ ...editedProductForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock (optionnel)</label>
                <input
                  type="number"
                  min="0"
                  value={editedProductForm.in_stock}
                  onChange={(e) => setEditedProductForm({ ...editedProductForm, in_stock: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image (optionnelle)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditedProductForm({ ...editedProductForm, image: e.target.files[0] })}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    const formData = new FormData();
                    formData.append('name', editedProductForm.name || '');
                    formData.append('description', editedProductForm.description || '');
                    formData.append('category_id', String(editedProductForm.category_id || ''));
                    formData.append('amount', String(editedProductForm.amount || ''));
                    if (editedProductForm.in_stock !== '' && editedProductForm.in_stock !== null) {
                      formData.append('in_stock', String(editedProductForm.in_stock));
                    }

                    if (editedProductForm.image) {
                      formData.append('image', editedProductForm.image);
                    }

                    setLoading(true);
                    try {
                      const response = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, {
                        method: 'PUT',
                        body: formData
                      });

                      if (response.ok) {
                        await loadProducts();
                        await loadCategories();
                        setEditingProduct(null);
                      } else {
                        const data = await response.json();
                        setError(data.detail || 'Erreur lors de la modification');
                      }
                    } catch (err) {
                      setError('Erreur de connexion');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {stockProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Entrees en stock</h3>
                <p className="text-sm text-gray-500">{stockProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setStockProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mb-4 flex gap-3">
              <input
                type="number"
                min="1"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Quantite"
              />
              <button
                type="button"
                onClick={handleCreateStockEntry}
                disabled={stockLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {stockLoading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantite</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockEntriesLoading && (
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-500" colSpan="2">Chargement...</td>
                    </tr>
                  )}
                  {!stockEntriesLoading && stockEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-2 text-sm text-gray-700">{entry.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {entry.created_at ? new Date(entry.created_at).toLocaleString('fr-FR') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {!stockEntriesLoading && stockEntries.length === 0 && (
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-500" colSpan="2">Aucune entree</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Détails de la commande</h3>
                <p className="text-sm text-gray-500">#{selectedOrder.id} • {selectedOrder.day} • {selectedOrder.time_slot}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Téléphone</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedOrder.phone_number}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Livraison</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedOrder.delivery_method || 'Non spécifié'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Statut</p>
                    <span className={`inline-flex px-2 py-1 mt-1 text-xs font-semibold rounded-full ${
                      selectedOrder.delivred ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedOrder.delivred ? 'Livrée' : 'En attente'}
                    </span>
                  </div>
                </div>

                <div className="bg-white border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900">Produits</h4>
                  </div>
                  <div className="divide-y">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={`${item.product?.id || idx}`} className="px-4 py-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                          {item.product?.image_url ? (
                            <img
                              src={`${API_BASE_URL}${item.product.image_url}`}
                              alt={item.product?.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{item.product?.name || 'Produit'}</p>
                          <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{item.total_amount} FCFA</p>
                          <p className="text-xs text-gray-500">{item.product?.amount} FCFA / unité</p>
                        </div>
                      </div>
                    ))}
                    {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                      <div className="px-4 py-6 text-sm text-gray-500">Aucun produit dans cette commande.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-900 text-white rounded-2xl p-6">
                  <p className="text-xs uppercase tracking-wider text-gray-300">Montant total</p>
                  <p className="text-3xl font-bold mt-2">{selectedOrder.total_amount} FCFA</p>
                  <div className="mt-4 text-xs text-gray-300">
                    <p>Articles: {(selectedOrder.items || []).length}</p>
                    <p>Créée le: {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
                  </div>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Résumé</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-semibold text-gray-900">
                      {(selectedOrder.items || []).reduce((sum, item) => sum + (item.total_amount || 0), 0)} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-semibold text-gray-900">
                      {selectedOrder.delivery_fee ? `${selectedOrder.delivery_fee} FCFA` : '—'}
                    </span>
                  </div>
                  <div className="border-t mt-3 pt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-900 font-semibold">Total</span>
                    <span className="text-gray-900 font-bold">{selectedOrder.total_amount} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;