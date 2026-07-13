import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Package, ShoppingCart, Eye, Check, Sparkles,
  LayoutDashboard, Tag, ToggleLeft, ToggleRight, Layers, X, FileDown,
  AlertCircle, CheckCircle2, Clock, Search, Loader2, TrendingUp,
  ChevronLeft, ChevronRight, Ban, XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// const API_BASE_URL = 'https://tabledesrois.jawess.com';
const API_BASE_URL = "http://localhost:10000";

/* ─── small reusable pieces ─────────────────────────────────────────────── */

const IconBtn = ({ onClick, title, disabled, variant = 'ghost', children, className = '' }) => {
  const base = 'inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    ghost:   'text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:ring-slate-300',
    blue:    'text-blue-600 hover:bg-blue-50  hover:text-blue-800  focus:ring-blue-300',
    red:     'text-red-500  hover:bg-red-50   hover:text-red-700   focus:ring-red-300',
    green:   'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 focus:ring-emerald-300',
    orange:  'text-orange-500 hover:bg-orange-50 hover:text-orange-700 focus:ring-orange-300',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Modal = ({ onClose, title, subtitle, children, maxWidth = 'max-w-md' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} modal-panel flex flex-col max-h-[90vh]`}>
      <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-4 mt-0.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="overflow-y-auto p-6 flex-1">{children}</div>
    </div>
  </div>
);

const FormField = ({ label, children, hint }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

const inputCls = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-shadow';

const StatusBadge = ({ delivered, cancelled }) => {
  if (cancelled) {
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold"><XCircle className="h-3 w-3" />Annulée</span>;
  }
  return delivered
    ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold"><CheckCircle2 className="h-3 w-3" />Livrée</span>
    : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold"><Clock className="h-3 w-3" />En attente</span>;
};

const Pagination = ({ page, pages, total, perPage, onPageChange }) => {
  if (pages <= 1) return null;

  const from = (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  const getPageNumbers = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 4)         return [1, 2, 3, 4, 5, '…', pages];
    if (page >= pages - 3) return [1, '…', pages-4, pages-3, pages-2, pages-1, pages];
    return [1, '…', page - 1, page, page + 1, '…', pages];
  };

  const btnBase = 'inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm font-semibold transition-all duration-150';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
      <p className="text-sm text-slate-500 order-2 sm:order-1">
        {from}–{to} sur <span className="font-semibold text-slate-700">{total}</span> commande{total !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`${btnBase} text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed`}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((p, i) =>
          p === '…'
            ? <span key={`e${i}`} className="w-8 text-center text-slate-400 text-sm select-none">…</span>
            : <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`${btnBase} ${
                  p === page
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className={`${btnBase} text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed`}
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/* ─── main component ─────────────────────────────────────────────────────── */

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
  const [stockMovementType, setStockMovementType] = useState('in');
  const [stockLoading, setStockLoading] = useState(false);
  const [stockEntriesLoading, setStockEntriesLoading] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportLoading, setExportLoading] = useState('');
  const [exportDeliveryStatus, setExportDeliveryStatus] = useState('delivered');

  const [editingCategory, setEditingCategory] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editedCategoryImage, setEditedCategoryImage] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [editedProductForm, setEditedProductForm] = useState({
    name: '', description: '', category_id: '', amount: '', in_stock: '', image: null
  });

  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPendingCount, setOrdersPendingCount] = useState(0);
  const ORDERS_PER_PAGE = 20;

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', image: null });
  const [productForm, setProductForm] = useState({
    name: '', description: '', category_id: '', amount: '', in_stock: '', image: null
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadOrders(1);
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, { method: 'GET', headers: { 'Accept': 'application/json' }, mode: 'cors' });
      setCategories(await response.json());
    } catch { setError('Erreur lors du chargement des catégories'); }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, { method: 'GET', headers: { 'Accept': 'application/json' }, mode: 'cors' });
      setProducts(await response.json());
    } catch { setError('Erreur lors du chargement des produits'); }
  };

  const toggleProductDisabled = async (product) => {
    setDisableLoadingId(product.id);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${product.id}/disabled`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, mode: 'cors',
        body: JSON.stringify({ disabled: !product.disabled })
      });
      if (!response.ok) throw new Error('Erreur lors de la mise a jour');
      await loadProducts();
      setError('');
    } catch (err) { setError('Erreur: ' + err.message); }
    finally { setDisableLoadingId(null); }
  };

  const loadOrders = async (page = 1) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders?page=${page}&limit=${ORDERS_PER_PAGE}`,
        { method: 'GET', headers: { 'Accept': 'application/json' }, mode: 'cors' }
      );
      const data = await response.json();
      setOrders(data.items);
      setOrdersTotal(data.total);
      setOrdersTotalPages(data.pages);
      setOrdersPendingCount(data.pending_count);
      setOrdersPage(page);
    } catch { setError('Erreur lors du chargement des commandes'); }
  };

  const loadStockEntries = async (productId) => {
    setStockEntriesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/stock-entries?product_id=${productId}`, { method: 'GET', headers: { 'Accept': 'application/json' }, mode: 'cors' });
      if (!response.ok) throw new Error('Erreur lors du chargement du stock');
      setStockEntries(await response.json());
    } catch (err) { setError('Erreur stock: ' + err.message); }
    finally { setStockEntriesLoading(false); }
  };

  const openStockModal = async (product) => {
    setStockProduct(product);
    setStockQuantity('');
    setStockMovementType('in');
    await loadStockEntries(product.id);
  };

  const handleCreateStockEntry = async () => {
    if (!stockProduct) return;
    const quantityNumber = Number(stockQuantity);
    if (!quantityNumber || quantityNumber <= 0) { setError('La quantité doit être supérieure à 0'); return; }

    const currentStock = (products.find(p => p.id === stockProduct.id)?.in_stock) ?? stockProduct.in_stock ?? 0;
    if (stockMovementType === 'out' && quantityNumber > currentStock) {
      setError(`Stock insuffisant: ${currentStock} disponible(s), ${quantityNumber} demandé(s)`);
      return;
    }

    setStockLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/stock-entries`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, mode: 'cors',
        body: JSON.stringify({ product_id: stockProduct.id, quantity: quantityNumber, movement_type: stockMovementType })
      });
      if (!response.ok) { const d = await response.json(); throw new Error(d.detail || 'Erreur'); }
      await loadStockEntries(stockProduct.id);
      await loadProducts();
      setStockQuantity('');
      setError('');
    } catch (err) { setError('Erreur: ' + err.message); }
    finally { setStockLoading(false); }
  };

  const updateOrderStatus = async (orderId, delivered) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, mode: 'cors',
        body: JSON.stringify({ delivered })
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      await loadOrders(ordersPage);
      setError('');
    } catch (err) { setError('Erreur: ' + err.message); }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Annuler cette commande ? Si elle était déjà livrée, le stock correspondant sera restitué.')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PUT', headers: { 'Accept': 'application/json' }, mode: 'cors'
      });
      if (!response.ok) { const d = await response.json(); throw new Error(d.detail || 'Erreur lors de l\'annulation'); }
      await loadOrders(ordersPage);
      await loadProducts();
      setError('');
    } catch (err) { setError('Erreur: ' + err.message); }
  };

  const getOrderStockIssues = (order) => {
    if (!order?.items?.length) return [];
    const stockByProductId = new Map(products.map(p => [p.id, Number(p.in_stock || 0)]));
    return order.items.map(item => {
      const available = stockByProductId.get(item.product?.id) ?? 0;
      const missing = Number(item.quantity || 0) - available;
      return missing > 0 ? { name: item.product?.name || `Produit ${item.product?.id}`, missing } : null;
    }).filter(Boolean);
  };

  const downloadOrdersExport = async (exportType) => {
    if (exportStartDate && exportEndDate && exportStartDate > exportEndDate) { setError("La date de début doit être avant la date de fin"); return; }
    setExportLoading(exportType);
    try {
      const params = new URLSearchParams({ export_type: exportType, delivery_status: exportDeliveryStatus });
      if (exportStartDate) params.append('start_date', exportStartDate);
      if (exportEndDate) params.append('end_date', exportEndDate);
      const response = await fetch(`${API_BASE_URL}/orders/export-excel?${params}`, {
        method: 'GET', headers: { 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }, mode: 'cors'
      });
      if (!response.ok) throw new Error("Erreur lors de l'exportation");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportType === 'lines' ? 'export_commandes_lignes.xlsx' : 'export_commandes_produits.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setError('');
    } catch (err) { setError("Erreur: " + err.message); }
    finally { setExportLoading(''); }
  };

  const handleCreateCategory = async () => {
    setLoading(true);
    try {
      if (!categoryForm.name?.trim()) { setError('Le nom de la catégorie est requis'); setLoading(false); return; }
      const formData = new FormData();
      formData.append('name', categoryForm.name.trim());
      if (categoryForm.image) formData.append('image', categoryForm.image);
      const response = await fetch(`${API_BASE_URL}/categories`, { method: 'POST', mode: 'cors', body: formData });
      if (response.ok) {
        await loadCategories();
        setShowCategoryModal(false);
        setCategoryForm({ name: '', image: null });
      } else { const d = await response.json(); setError(d.detail || 'Erreur lors de la création'); }
    } catch { setError('Erreur de connexion'); }
    setLoading(false);
  };

  const handleCreateProduct = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('category_id', productForm.category_id);
    formData.append('amount', productForm.amount);
    if (productForm.in_stock !== '' && productForm.in_stock !== null) formData.append('in_stock', productForm.in_stock);
    if (productForm.image) formData.append('image', productForm.image);
    try {
      const response = await fetch(`${API_BASE_URL}/products`, { method: 'POST', mode: 'cors', body: formData });
      if (response.ok) {
        await loadProducts(); await loadCategories();
        setShowProductModal(false);
        setProductForm({ name: '', description: '', category_id: '', amount: '', in_stock: '', image: null });
      } else { const d = await response.json(); setError(d.detail || 'Erreur lors de la création'); }
    } catch { setError('Erreur de connexion'); }
    setLoading(false);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
      if (response.ok) await loadCategories();
      else setError('Erreur lors de la suppression');
    } catch { setError('Erreur de connexion'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (response.ok) await loadProducts();
      else setError('Erreur lors de la suppression');
    } catch { setError('Erreur de connexion'); }
  };

  const handleUpdateCategory = async (categoryId, updatedName, updatedImage) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', updatedName);
      if (updatedImage) formData.append('image', updatedImage);
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, { method: 'PUT', mode: 'cors', body: formData });
      if (response.ok) { await loadCategories(); setError(''); }
      else {
        const d = await response.json();
        setError(Array.isArray(d.detail) ? d.detail.map(e => e.msg).join(', ') : d.detail || 'Erreur');
      }
    } catch { setError('Erreur de connexion'); }
    setLoading(false);
  };

  /* ─── sub views ────────────────────────────────────────────────────────── */

  const pendingOrders = ordersPendingCount;

  const Dashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Vue d'ensemble</h2>
        <p className="text-sm text-slate-500 mt-1">Résumé de votre activité</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Catégories', value: categories.length, icon: Tag, color: 'from-violet-500 to-purple-400', bg: 'bg-violet-50', text: 'text-violet-700' },
          { label: 'Produits', value: products.length, icon: Package, color: 'from-emerald-500 to-green-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
          { label: 'Commandes', value: orders.length, icon: ShoppingCart, color: 'from-blue-500 to-cyan-400', bg: 'bg-blue-50', text: 'text-blue-700' },
          { label: 'En attente', value: pendingOrders, icon: Clock, color: 'from-amber-500 to-orange-400', bg: 'bg-amber-50', text: 'text-amber-700' },
        ].map(({ label, value, icon: Icon, color, bg, text }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="text-3xl font-bold text-slate-900 leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Commandes récentes</h3>
          </div>
          {orders.slice(0, 5).map(order => (
            <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">{order.order_number || `#${order.id}`} — {order.phone_number}</p>
                <p className="text-xs text-slate-400">{order.day} · {order.time_slot}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900">{order.total_amount} <span className="text-xs font-normal text-slate-400">FCFA</span></span>
                <StatusBadge delivered={order.delivred} cancelled={order.cancelled} />
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">Aucune commande</p>}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Stock faible</h3>
          </div>
          {products.filter(p => (p.in_stock ?? 0) < 5).slice(0, 6).map(p => (
            <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
              <p className="text-sm font-semibold text-slate-800 truncate max-w-[60%]">{p.name}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.in_stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                {p.in_stock ?? 0} en stock
              </span>
            </div>
          ))}
          {products.filter(p => (p.in_stock ?? 0) < 5).length === 0 && (
            <div className="flex items-center gap-2 py-4 justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-sm text-slate-400">Tous les stocks sont suffisants</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CategoriesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Catégories</h2>
          <p className="text-sm text-slate-500 mt-0.5">{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCategoryModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-150"
        >
          <Plus className="h-4 w-4" />
          Nouvelle catégorie
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Image</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Produits</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, i) => (
                <tr key={category.id} className={`hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">{category.name}</td>
                  <td className="px-5 py-4">
                    {category.image_url
                      ? <img src={`${API_BASE_URL}${category.image_url}`} alt={category.name} className="h-10 w-10 rounded-lg object-cover border border-slate-100" />
                      : <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center"><Tag className="h-4 w-4 text-slate-400" /></div>
                    }
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      {category.product_count} produit{category.product_count !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn
                        variant="blue"
                        title="Modifier"
                        onClick={() => { setEditingCategory(category); setEditedCategoryName(category.name); setEditedCategoryImage(null); }}
                      >
                        <Edit className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn variant="red" title="Supprimer" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan="4" className="px-5 py-12 text-center text-sm text-slate-400">Aucune catégorie</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProductsTab = () => {
    const filtered = products.filter(p => {
      const q = productSearchQuery.trim().toLowerCase();
      if (!q) return true;
      return (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Produits</h2>
            <p className="text-sm text-slate-500 mt-0.5">{filtered.length} produit{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowProductModal(true)}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-150 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Nouveau produit
          </button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={productSearchQuery}
            onChange={e => setProductSearchQuery(e.target.value)}
            placeholder="Rechercher un produit…"
            className={`${inputCls} pl-9`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
                product.disabled ? 'opacity-60 border-slate-200' : 'border-slate-100'
              }`}
            >
              <div className="relative">
                <img
                  src={`${API_BASE_URL}${product.image_url}`}
                  alt={product.name}
                  className="h-44 w-full object-cover bg-slate-100"
                />
                {product.disabled && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">Désactivé</span>
                )}
                {(product.in_stock ?? 0) === 0 && !product.disabled && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-400 text-white text-xs font-bold">Rupture</span>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-900 truncate">{product.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>

                <div className="flex items-end justify-between mt-3">
                  <div>
                    <p className="text-lg font-bold text-emerald-600">
                      {product.amount ? `${Number(product.amount).toLocaleString('fr-FR')} FCFA` : '—'}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">Stock : {product.in_stock ?? 0}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconBtn
                      variant="blue"
                      title="Modifier"
                      onClick={() => {
                        setEditingProduct(product);
                        setEditedProductForm({ name: product.name, description: product.description, category_id: product.category.id, amount: product.amount, in_stock: product.in_stock ?? '', image: null });
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn
                      variant="ghost"
                      title="Entrées en stock"
                      onClick={() => openStockModal(product)}
                    >
                      <Layers className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn
                      variant={product.disabled ? 'green' : 'orange'}
                      title={product.disabled ? 'Activer' : 'Désactiver'}
                      disabled={disableLoadingId === product.id}
                      onClick={() => toggleProductDisabled(product)}
                    >
                      {disableLoadingId === product.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : product.disabled
                          ? <ToggleLeft className="h-3.5 w-3.5" />
                          : <ToggleRight className="h-3.5 w-3.5" />
                      }
                    </IconBtn>
                    <IconBtn variant="red" title="Supprimer" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-slate-400">
              <Package className="h-8 w-8 mx-auto mb-3 text-slate-300" />
              Aucun produit trouvé
            </div>
          )}
        </div>
      </div>
    );
  };

  const OrdersTab = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Commandes</h2>
        <p className="text-sm text-slate-500 mt-0.5">{ordersTotal} commande{ordersTotal !== 1 ? 's' : ''} · {pendingOrders} en attente</p>
      </div>

      {/* Export controls */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <FileDown className="h-4 w-4 text-emerald-600" />
          Exporter les commandes
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Date début</label>
            <input type="date" value={exportStartDate} onChange={e => setExportStartDate(e.target.value)} className={inputCls + ' w-auto'} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Date fin</label>
            <input type="date" value={exportEndDate} onChange={e => setExportEndDate(e.target.value)} className={inputCls + ' w-auto'} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Statut</label>
            <select value={exportDeliveryStatus} onChange={e => setExportDeliveryStatus(e.target.value)} className={inputCls + ' w-auto'}>
              <option value="delivered">Livrées</option>
              <option value="pending">Non livrées</option>
              <option value="cancelled">Annulées</option>
              <option value="all">Toutes</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => downloadOrdersExport('lines')}
              disabled={exportLoading === 'lines'}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {exportLoading === 'lines' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              Lignes
            </button>
            <button
              onClick={() => downloadOrdersExport('products')}
              disabled={exportLoading === 'products'}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {exportLoading === 'products' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              Produits
            </button>
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['ID', 'Téléphone', 'Date / Créneau', 'Méthode', 'Total', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr key={order.id} className={`hover:bg-slate-50 transition-colors ${order.cancelled ? 'opacity-60' : ''} ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                  <td className="px-5 py-4 text-sm font-bold text-slate-900">{order.order_number || `#${order.id}`}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{order.phone_number}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    <span className="font-semibold">{order.day}</span>
                    <span className="text-slate-400"> · {order.time_slot}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      order.delivery_method === 'self' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {order.delivery_method === 'self' ? 'Retrait' : 'Livraison'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-900">{order.total_amount} <span className="text-xs font-normal text-slate-400">FCFA</span></td>
                  <td className="px-5 py-4"><StatusBadge delivered={order.delivred} cancelled={order.cancelled} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <IconBtn variant="blue" title="Voir les détails" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </IconBtn>
                      {!order.cancelled && !order.delivred && (
                        <IconBtn
                          variant="green"
                          title="Marquer comme livrée"
                          onClick={() => {
                            const issues = getOrderStockIssues(order);
                            if (issues.length > 0) {
                              setError(`Stock insuffisant pour ${order.order_number || `#${order.id}`}: ${issues.map(i => `${i.name} (manque ${i.missing})`).join(', ')}`);
                              return;
                            }
                            updateOrderStatus(order.id, true);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </IconBtn>
                      )}
                      {!order.cancelled && (
                        <IconBtn variant="red" title="Annuler la commande" onClick={() => cancelOrder(order.id)}>
                          <Ban className="h-4 w-4" />
                        </IconBtn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="7" className="px-5 py-12 text-center text-sm text-slate-400">Aucune commande</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={ordersPage}
          pages={ordersTotalPages}
          total={ordersTotal}
          perPage={ORDERS_PER_PAGE}
          onPageChange={(p) => loadOrders(p)}
        />
      </div>
    </div>
  );

  /* ─── tabs config ────────────────────────────────────────────────────────── */
  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, badge: null },
    { id: 'categories', label: 'Catégories',      icon: Tag,             badge: categories.length || null },
    { id: 'products',   label: 'Produits',         icon: Package,         badge: products.length   || null },
    { id: 'orders',     label: 'Commandes',        icon: ShoppingCart,    badge: pendingOrders     || null },
  ];

  /* ─── render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center shadow-sm flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">Table des Rois</h1>
                <p className="text-xs text-slate-400 hidden sm:block">Administration</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En ligne
              </span>
              <Link to="/privacy-policy" className="text-xs text-slate-400 hover:text-slate-700 transition-colors hidden sm:block">
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Navigation ── */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 sm:px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-150 border-b-2 ${
                  activeTab === tab.id
                    ? 'text-emerald-600 border-emerald-500'
                    : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-200'
                }`}
              >
                <tab.icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs capitalize">{tab.id === 'dashboard' ? 'Accueil' : tab.id}</span>
                {tab.badge !== null && (
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                    activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3.5 rounded-xl text-sm font-medium shadow-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}

        {activeTab === 'dashboard'  && <Dashboard />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'products'   && renderProductsTab()}
        {activeTab === 'orders'     && <OrdersTab />}
      </main>

      {/* ═══════════════════════════════════════════════════════ MODALS ══ */}

      {/* ── Nouvelle catégorie ── */}
      {showCategoryModal && (
        <Modal title="Nouvelle catégorie" onClose={() => setShowCategoryModal(false)}>
          <div className="space-y-4">
            <FormField label="Nom de la catégorie">
              <input
                type="text"
                value={categoryForm.name}
                onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Ex: Fruits tropicaux"
                className={inputCls}
              />
            </FormField>
            <FormField label="Image" hint="Optionnel — formats acceptés : JPG, PNG, WebP">
              <input
                type="file"
                accept="image/*"
                onChange={e => setCategoryForm({ ...categoryForm, image: e.target.files?.[0] || null })}
                className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`}
              />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Annuler</button>
              <button onClick={handleCreateCategory} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {loading ? 'Création…' : 'Créer'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modifier catégorie ── */}
      {editingCategory && (
        <Modal title="Modifier la catégorie" subtitle={editingCategory.name} onClose={() => setEditingCategory(null)}>
          <div className="space-y-4">
            <FormField label="Nom">
              <input
                type="text"
                value={editedCategoryName}
                onChange={e => setEditedCategoryName(e.target.value)}
                className={inputCls}
              />
            </FormField>
            <FormField label="Image" hint="Optionnel — laissez vide pour conserver l'image actuelle">
              {editingCategory?.image_url && !editedCategoryImage && (
                <img src={`${API_BASE_URL}${editingCategory.image_url}`} alt={editingCategory.name} className="h-16 w-16 rounded-xl object-cover border border-slate-100 mb-2" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={e => setEditedCategoryImage(e.target.files?.[0] || null)}
                className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`}
              />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingCategory(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Annuler</button>
              <button
                disabled={loading}
                onClick={async () => { await handleUpdateCategory(editingCategory.id, editedCategoryName, editedCategoryImage); setEditingCategory(null); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {loading ? 'Modification…' : 'Modifier'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Nouveau produit ── */}
      {showProductModal && (
        <Modal title="Nouveau produit" onClose={() => setShowProductModal(false)}>
          <div className="space-y-4">
            <FormField label="Nom du produit">
              <input type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="Ex: Mangue Amélie" className={inputCls} />
            </FormField>
            <FormField label="Description">
              <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className={`${inputCls} resize-none`} rows="3" placeholder="Décrivez le produit…" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Prix (FCFA)">
                <input type="number" value={productForm.amount} onChange={e => setProductForm({ ...productForm, amount: e.target.value })} className={inputCls} placeholder="0" />
              </FormField>
              <FormField label="Stock initial" hint="Optionnel">
                <input type="number" min="0" value={productForm.in_stock} onChange={e => setProductForm({ ...productForm, in_stock: e.target.value })} className={inputCls} placeholder="0" />
              </FormField>
            </div>
            <FormField label="Catégorie">
              <select value={productForm.category_id} onChange={e => setProductForm({ ...productForm, category_id: e.target.value })} className={inputCls}>
                <option value="">Sélectionner une catégorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Image">
              <input type="file" accept="image/*" onChange={e => setProductForm({ ...productForm, image: e.target.files[0] })} className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`} />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowProductModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Annuler</button>
              <button onClick={handleCreateProduct} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {loading ? 'Création…' : 'Créer'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modifier produit ── */}
      {editingProduct && (
        <Modal title="Modifier le produit" subtitle={editingProduct.name} onClose={() => setEditingProduct(null)}>
          <div className="space-y-4">
            <FormField label="Nom">
              <input type="text" value={editedProductForm.name} onChange={e => setEditedProductForm({ ...editedProductForm, name: e.target.value })} className={inputCls} />
            </FormField>
            <FormField label="Description">
              <textarea value={editedProductForm.description} onChange={e => setEditedProductForm({ ...editedProductForm, description: e.target.value })} className={`${inputCls} resize-none`} rows="3" />
            </FormField>
            <FormField label="Catégorie">
              <select value={editedProductForm.category_id} onChange={e => setEditedProductForm({ ...editedProductForm, category_id: e.target.value })} className={inputCls}>
                <option value="">Sélectionner une catégorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Prix (FCFA)">
                <input type="number" value={editedProductForm.amount} onChange={e => setEditedProductForm({ ...editedProductForm, amount: e.target.value })} className={inputCls} />
              </FormField>
              <FormField label="Stock" hint="Optionnel">
                <input type="number" min="0" value={editedProductForm.in_stock} onChange={e => setEditedProductForm({ ...editedProductForm, in_stock: e.target.value })} className={inputCls} />
              </FormField>
            </div>
            <FormField label="Image" hint="Optionnel — laissez vide pour conserver l'image actuelle">
              <input type="file" accept="image/*" onChange={e => setEditedProductForm({ ...editedProductForm, image: e.target.files[0] })} className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`} />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingProduct(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Annuler</button>
              <button
                disabled={loading}
                onClick={async () => {
                  const formData = new FormData();
                  formData.append('name', editedProductForm.name || '');
                  formData.append('description', editedProductForm.description || '');
                  formData.append('category_id', String(editedProductForm.category_id || ''));
                  formData.append('amount', String(editedProductForm.amount || ''));
                  if (editedProductForm.in_stock !== '' && editedProductForm.in_stock !== null) formData.append('in_stock', String(editedProductForm.in_stock));
                  if (editedProductForm.image) formData.append('image', editedProductForm.image);
                  setLoading(true);
                  try {
                    const response = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, { method: 'PUT', body: formData });
                    if (response.ok) { await loadProducts(); await loadCategories(); setEditingProduct(null); }
                    else { const d = await response.json(); setError(d.detail || 'Erreur'); }
                  } catch { setError('Erreur de connexion'); }
                  finally { setLoading(false); }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {loading ? 'Modification…' : 'Modifier'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Stock entries ── */}
      {stockProduct && (
        <Modal
          title="Mouvements de stock"
          subtitle={stockProduct.name}
          onClose={() => setStockProduct(null)}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
              <span className="text-sm font-medium text-slate-500">Stock actuel</span>
              <span className="text-lg font-bold text-slate-900">
                {(products.find(p => p.id === stockProduct.id)?.in_stock) ?? stockProduct.in_stock ?? 0}
              </span>
            </div>

            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setStockMovementType('in')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  stockMovementType === 'in' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Plus className="h-4 w-4" />
                Entrée
              </button>
              <button
                type="button"
                onClick={() => setStockMovementType('out')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  stockMovementType === 'out' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Retrait
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={stockQuantity}
                onChange={e => setStockQuantity(e.target.value)}
                className={`${inputCls} flex-1`}
                placeholder={stockMovementType === 'in' ? 'Quantité à ajouter' : 'Quantité à retirer'}
              />
              <button
                onClick={handleCreateStockEntry}
                disabled={stockLoading}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex-shrink-0 ${
                  stockMovementType === 'in' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {stockLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : stockMovementType === 'in' ? <Plus className="h-4 w-4" /> : <Trash2 className="h-3.5 w-3.5" />
                }
                {stockMovementType === 'in' ? 'Ajouter' : 'Retirer'}
              </button>
            </div>

            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Mouvement</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stockEntriesLoading && (
                    <tr><td colSpan="2" className="px-4 py-6 text-center text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></td></tr>
                  )}
                  {!stockEntriesLoading && stockEntries.map(entry => {
                    const isOut = entry.movement_type === 'out';
                    return (
                      <tr key={entry.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className={`px-4 py-3 text-sm font-bold ${isOut ? 'text-red-600' : 'text-emerald-600'}`}>
                          {isOut ? '−' : '+'}{entry.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{entry.created_at ? new Date(entry.created_at).toLocaleString('fr-FR') : 'N/A'}</td>
                      </tr>
                    );
                  })}
                  {!stockEntriesLoading && stockEntries.length === 0 && (
                    <tr><td colSpan="2" className="px-4 py-8 text-center text-sm text-slate-400">Aucun mouvement enregistré</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Détails commande ── */}
      {selectedOrder && (
        <Modal
          title="Détails de la commande"
          subtitle={`${selectedOrder.order_number || `#${selectedOrder.id}`} · ${selectedOrder.day} · ${selectedOrder.time_slot}`}
          onClose={() => setSelectedOrder(null)}
          maxWidth="max-w-4xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Téléphone',  value: selectedOrder.phone_number },
                  { label: 'Méthode',    value: selectedOrder.delivery_method === 'self' ? 'Retrait client' : 'Livraison' },
                  { label: 'Adresse',    value: selectedOrder.delivery_description || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3.5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-sm font-semibold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-800">Produits commandés</h4>
                </div>
                <div className="divide-y divide-slate-50">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={item.product?.id || idx} className="px-4 py-3.5 flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                        {item.product?.image_url
                          ? <img src={`${API_BASE_URL}${item.product.image_url}`} alt={item.product?.name} className="h-full w-full object-cover" />
                          : <Package className="h-5 w-5 text-slate-400 m-3" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{item.product?.name || 'Produit'}</p>
                        <p className="text-xs text-slate-400">Qté : {item.quantity} × {item.product?.amount} FCFA</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900 flex-shrink-0">{item.total_amount} <span className="text-xs font-normal text-slate-400">FCFA</span></p>
                    </div>
                  ))}
                  {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                    <p className="px-4 py-6 text-sm text-slate-400 text-center">Aucun produit</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Montant total</p>
                <p className="text-4xl font-black mt-1">{selectedOrder.total_amount}</p>
                <p className="text-sm text-slate-400">FCFA</p>
                <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-400 space-y-1">
                  <p>{(selectedOrder.items || []).length} article{(selectedOrder.items || []).length !== 1 ? 's' : ''}</p>
                  <p>Créée le {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Statut</p>
                <StatusBadge delivered={selectedOrder.delivred} cancelled={selectedOrder.cancelled} />
                {!selectedOrder.cancelled && !selectedOrder.delivred && (
                  <button
                    onClick={async () => { await updateOrderStatus(selectedOrder.id, true); setSelectedOrder(null); }}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    Marquer comme livrée
                  </button>
                )}
                {!selectedOrder.cancelled && (
                  <button
                    onClick={async () => { await cancelOrder(selectedOrder.id); setSelectedOrder(null); }}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition-colors"
                  >
                    <Ban className="h-4 w-4" />
                    Annuler la commande
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default AdminDashboard;
