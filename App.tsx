import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  ShoppingBag, MessageCircle, Menu, X, Instagram, Facebook, Twitter, 
  ArrowRight, ChevronRight, Search, Eye, Star, CheckCircle, 
  Package, Clock, ShieldCheck, Heart, Trash2, MapPin, User,
  SlidersHorizontal, History, LogOut
} from 'lucide-react';
import { Product, CartItem, Order, Review } from './types';
import { PRODUCTS, FAQS } from './constants';

const { Routes, Route, useLocation, useNavigate, useParams, Link } = ReactRouterDOM as any;

// --- Mock Backend Logic ---
const MockBackend = {
  getOrders: (): Order[] => JSON.parse(localStorage.getItem('aur_orders') || '[]'),
  saveOrder: (order: Order) => {
    const orders = MockBackend.getOrders();
    orders.unshift(order);
    localStorage.setItem('aur_orders', JSON.stringify(orders));
  },
  getReviews: (productId: string): Review[] => {
    const all = JSON.parse(localStorage.getItem('aur_reviews') || '[]');
    return all.filter((r: Review) => r.productId === productId && r.status === 'published');
  },
  submitReview: (review: Review) => {
    const all = JSON.parse(localStorage.getItem('aur_reviews') || '[]');
    all.push(review);
    localStorage.setItem('aur_reviews', JSON.stringify(all));
  },
  subscribeNewsletter: (email: string) => {
    const list = JSON.parse(localStorage.getItem('aur_subscribers') || '[]');
    if (!list.includes(email)) list.push(email);
    localStorage.setItem('aur_subscribers', JSON.stringify(list));
  },
  getWishlist: (): string[] => JSON.parse(localStorage.getItem('aur_wishlist') || '[]'),
  toggleWishlist: (productId: string) => {
    let list = MockBackend.getWishlist();
    if (list.includes(productId)) {
      list = list.filter(id => id !== productId);
    } else {
      list.push(productId);
    }
    localStorage.setItem('aur_wishlist', JSON.stringify(list));
    return list;
  }
};

// --- Contexts ---
interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

// --- Helper Components ---

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const SearchOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query) return [];
    return PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#0A0A0A] flex flex-col p-8 md:p-20 animate-fadeIn">
      <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
        <X size={32} />
      </button>
      <div className="max-w-4xl mx-auto w-full pt-20">
        <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.5em] mb-4 font-bold">Discover the Collection</p>
        <div className="relative border-b border-white/10 mb-12">
          <input 
            autoFocus
            type="text" 
            placeholder="Search for footwear, wallets, sunglasses..." 
            className="w-full bg-transparent border-none text-3xl md:text-5xl serif text-white py-4 focus:ring-0 placeholder:text-[#222]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-[#333]" size={32} />
        </div>

        {query && (
          <div className="grid gap-8">
            {results.length > 0 ? (
              results.map(p => (
                <button 
                  key={p.id}
                  onClick={() => { navigate(`/shop/${p.category}/${p.slug}`); onClose(); }}
                  className="flex items-center gap-8 group text-left"
                >
                  <div className="w-20 h-24 bg-[#111] overflow-hidden">
                    <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                  </div>
                  <div>
                    <h3 className="text-white uppercase tracking-widest text-sm font-bold group-hover:text-[#C9A84C] transition-colors">{p.name}</h3>
                    <p className="text-[#666] text-[10px] uppercase tracking-widest mt-1">${p.price} · {p.category}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-[#444] serif italic text-xl">"No artifacts found for this inquiry."</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();

  const navLinks = [
    { name: 'Shop All', path: '/shop' },
    { name: 'Shoes', path: '/shop/shoes' },
    { name: 'Wallets', path: '/shop/wallets' },
    { name: 'Accessories', path: '/shop' },
    { name: 'About', path: '/about' },
  ];

  return (
    <>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[10px] uppercase tracking-widest font-medium hover:text-[#C9A84C] transition-colors ${
                    location.pathname === link.path ? 'text-[#C9A84C]' : 'text-[#999999]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="absolute left-1/2 -translate-x-1/2">
              <Link to="/" className="text-2xl font-bold serif tracking-tighter text-white uppercase">Aurelius</Link>
            </div>

            <div className="flex items-center space-x-5">
              <button onClick={() => setIsSearchOpen(true)} className="text-[#999999] hover:text-[#C9A84C] transition-colors">
                <Search size={20} />
              </button>
              <Link to="/orders" className="text-[#999999] hover:text-[#C9A84C] transition-colors hidden sm:block">
                <User size={20} />
              </Link>
              <Link to="/wishlist" className="relative group text-[#999999] hover:text-[#C9A84C] transition-colors">
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-white text-[#0A0A0A] text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative group text-[#999999] hover:text-white transition-colors">
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#C9A84C] text-[#0A0A0A] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-[#0A0A0A] z-40 pt-24 px-8 flex flex-col space-y-8 animate-fadeIn">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="text-3xl serif text-white" onClick={() => setIsMobileMenuOpen(false)}>
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-white/5 w-full"></div>
            <Link to="/orders" className="text-xl serif text-white flex items-center gap-4" onClick={() => setIsMobileMenuOpen(false)}>
              <History size={20} /> Order History
            </Link>
          </div>
        )}
      </nav>
    </>
  );
};

const QuickViewModal = ({ product, isOpen, onClose }: { product: Product | null, isOpen: boolean, onClose: () => void }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (product) setSelectedSize(product.sizes?.[0] || '');
  }, [product]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0A0A0A] border border-white/10 max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-20"><X size={32} /></button>
        <div className="aspect-[4/5] bg-[#111]"><img src={product.images[0]} className="w-full h-full object-cover opacity-90" alt={product.name} /></div>
        <div className="p-12 md:p-20 flex flex-col justify-center">
          <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.5em] mb-6 font-bold">{product.category}</p>
          <h2 className="text-4xl serif mb-6 tracking-tight uppercase leading-none">{product.name}</h2>
          <p className="text-2xl mb-10 font-light tracking-widest">${product.price}</p>
          {product.sizes && (
            <div className="mb-12">
              <label className="text-[9px] uppercase tracking-[0.3em] text-white font-bold block mb-6">Select Sizing</label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} className={`px-6 py-3 border text-[10px] font-bold tracking-widest transition-all ${selectedSize === s ? 'bg-white text-black border-white' : 'border-white/10 text-[#444] hover:border-white hover:text-white'}`}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <button 
            onClick={() => { addToCart(product.id, 1, selectedSize); onClose(); }} 
            className="w-full bg-[#C9A84C] text-[#0A0A0A] py-5 text-[10px] font-extrabold uppercase tracking-[0.3em] hover:bg-white transition-all shadow-xl"
          >
            Add To Cart
          </button>
          <Link to={`/shop/${product.category}/${product.slug}`} onClick={onClose} className="mt-8 text-center text-[9px] uppercase tracking-[0.3em] text-[#444] hover:text-[#C9A84C] border-b border-transparent hover:border-[#C9A84C] pb-1 w-fit mx-auto transition-all">View Full Specifications</Link>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onQuickView }: { product: Product, onQuickView: (p: Product) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="group relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-[#111111]">
        <Link to={`/shop/${product.category}/${product.slug}`}>
          <img 
            src={isHovered && product.images[1] ? product.images[1] : product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
          />
        </Link>
        
        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
          <button 
            onClick={() => toggleWishlist(product.id)} 
            className={`p-3 transition-colors ${isWishlisted ? 'bg-[#C9A84C] text-black' : 'bg-white text-black hover:bg-black hover:text-white'}`}
          >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button onClick={() => onQuickView(product)} className="bg-white text-black p-3 hover:bg-[#C9A84C] transition-colors"><Eye size={16} /></button>
          <button onClick={() => addToCart(product.id, 1, product.sizes?.[0])} className="bg-white text-black p-3 hover:bg-[#C9A84C] transition-colors"><ShoppingBag size={16} /></button>
        </div>
        
        {product.isBestseller && <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md text-white text-[9px] px-3 py-1 uppercase tracking-widest border border-white/20">Bestseller</span>}
      </div>
      <div className="mt-6 text-center px-4">
        <p className="text-[#666] text-[10px] uppercase tracking-[0.3em] mb-2">{product.category}</p>
        <h3 className="text-sm font-medium tracking-wide mb-2 text-white group-hover:text-[#C9A84C] transition-colors uppercase truncate">{product.name}</h3>
        <p className="text-[#C9A84C] text-sm font-semibold tracking-wider">${product.price}</p>
      </div>
    </div>
  );
};

// --- Pages ---

const HomePage = () => {
  const [qvProduct, setQvProduct] = useState<Product | null>(null);

  return (
    <div className="pt-20">
      <QuickViewModal product={qvProduct} isOpen={!!qvProduct} onClose={() => setQvProduct(null)} />
      
      {/* Hero */}
      <section className="relative h-[95vh] flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1550246140-5119ae4790b8?auto=format&fit=crop&q=90&w=2400" 
          className="absolute inset-0 w-full h-full object-cover scale-105" 
          alt="Hero" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#0A0A0A]"></div>
        <div className="relative z-10 text-center px-4 animate-fadeIn">
          <p className="text-[#C9A84C] text-xs uppercase tracking-[0.6em] mb-8 font-bold">The Heritage Collection</p>
          <h1 className="text-6xl md:text-[10rem] text-white mb-12 tracking-tighter leading-none serif">Aurelius</h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link to="/shop" className="bg-[#C9A84C] text-[#0A0A0A] px-12 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white transition-all shadow-2xl">
              Shop Now
            </Link>
            <Link to="/about" className="border border-white/30 text-white px-12 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-black transition-all backdrop-blur-sm">
              Our Legacy
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl serif mb-4">Curated Verticals</h2>
          <div className="w-12 h-0.5 bg-[#C9A84C] mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Footwear', slug: 'shoes', img: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800' },
            { name: 'Leather Goods', slug: 'wallets', img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800' },
            { name: 'Accessories', slug: 'sunglasses', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800' }
          ].map((cat) => (
            <Link key={cat.slug} to={`/shop/${cat.slug}`} className="group relative aspect-[4/5] overflow-hidden bg-black">
              <img src={cat.img} alt={cat.name} className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-1000" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 border border-white/0 group-hover:border-white/10 transition-all m-4">
                <h3 className="text-white text-xl serif mb-2 uppercase tracking-widest">{cat.name}</h3>
                <span className="text-[#C9A84C] text-[9px] uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all">Explore Vertical</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Grid */}
      <section className="bg-[#111111] py-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.4em] mb-4">Aurelius Select</p>
              <h2 className="text-4xl serif">The Bestsellers</h2>
            </div>
            <Link to="/shop" className="text-[#666] hover:text-[#C9A84C] text-[10px] uppercase tracking-[0.2em] font-bold border-b border-transparent hover:border-[#C9A84C] pb-2 transition-all">
              View All Essentials
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {PRODUCTS.filter(p => p.isBestseller).map(p => <ProductCard key={p.id} product={p} onQuickView={setQvProduct} />)}
          </div>
        </div>
      </section>
    </div>
  );
};

const ShopPage = () => {
  const { category } = useParams();
  const [filter, setFilter] = useState<string>(category || 'all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [qvProduct, setQvProduct] = useState<Product | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    if (category) setFilter(category);
    else setFilter('all');
  }, [category]);

  const sortedAndFilteredProducts = useMemo(() => {
    let list = PRODUCTS.filter(p => filter === 'all' || p.category === filter);
    
    switch (sortBy) {
      case 'price-low': list.sort((a, b) => a.price - b.price); break;
      case 'price-high': list.sort((a, b) => b.price - a.price); break;
      case 'newest': list.reverse(); break;
    }
    
    return list;
  }, [filter, sortBy]);

  const displayedProducts = sortedAndFilteredProducts.slice(0, visibleCount);

  return (
    <div className="pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
      <QuickViewModal product={qvProduct} isOpen={!!qvProduct} onClose={() => setQvProduct(null)} />
      
      <header className="mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-white/5 pb-12">
          <div>
            <nav className="flex items-center text-[9px] uppercase tracking-[0.4em] text-[#666] mb-8">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={10} className="mx-4" />
              <span className="text-[#C9A84C]">Shop</span>
            </nav>
            <h1 className="text-6xl serif capitalize tracking-tight">{filter === 'all' ? 'The Collection' : filter}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3 bg-[#111] px-6 py-3 border border-white/5">
              <SlidersHorizontal size={14} className="text-[#C9A84C]" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[10px] uppercase tracking-widest font-bold border-none text-white focus:ring-0 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-12">
          {['all', 'shoes', 'wallets', 'belts', 'sunglasses', 'bracelets'].map(cat => (
            <button 
              key={cat} 
              onClick={() => { setFilter(cat); setVisibleCount(8); }} 
              className={`px-8 py-3 border text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
                filter === cat ? 'bg-white text-black border-white shadow-xl' : 'border-white/10 text-[#666] hover:border-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 animate-fadeIn">
        {displayedProducts.map(p => <ProductCard key={p.id} product={p} onQuickView={setQvProduct} />)}
      </div>

      {visibleCount < sortedAndFilteredProducts.length && (
        <div className="mt-24 text-center">
          <button 
            onClick={() => setVisibleCount(v => v + 4)} 
            className="px-16 py-5 border border-white/10 text-[10px] uppercase tracking-[0.4em] font-bold text-[#666] hover:text-white hover:border-white transition-all"
          >
            Load More Pieces
          </button>
        </div>
      )}
    </div>
  );
};

const WishlistPage = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const [qvProduct, setQvProduct] = useState<Product | null>(null);

  const wishlistProducts = useMemo(() => 
    PRODUCTS.filter(p => wishlist.includes(p.id)), 
  [wishlist]);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-8 min-h-screen">
      <QuickViewModal product={qvProduct} isOpen={!!qvProduct} onClose={() => setQvProduct(null)} />
      <header className="mb-20 text-center">
        <h1 className="text-5xl serif mb-6 tracking-tighter">Wishlist</h1>
        <div className="w-12 h-0.5 bg-[#C9A84C] mx-auto mb-8"></div>
        <p className="text-[#666] text-xs uppercase tracking-[0.4em] font-bold">Your Curated Selections</p>
      </header>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-32 bg-[#111111] border border-white/5">
          <p className="text-[#444] mb-12 italic serif text-2xl">"Your gallery of desires is currently unoccupied."</p>
          <Link to="/shop" className="bg-[#C9A84C] text-[#0A0A0A] px-16 py-5 text-[10px] uppercase tracking-[0.3em] font-extrabold hover:bg-white transition-all shadow-xl">
            Discover Essentials
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 animate-fadeIn">
          {wishlistProducts.map(p => <ProductCard key={p.id} product={p} onQuickView={setQvProduct} />)}
        </div>
      )}
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(MockBackend.getOrders());
  }, []);

  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 min-h-screen">
      <header className="mb-20">
        <h1 className="text-5xl serif mb-6 tracking-tighter">Order History</h1>
        <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.4em] font-bold">Manage Your Acquisitions</p>
      </header>

      {orders.length === 0 ? (
        <div className="text-center py-24 bg-[#111] border border-white/5">
          <History size={48} className="mx-auto mb-8 text-[#222]" />
          <p className="text-[#666] serif italic text-xl">"No past transactions found in our ledger."</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map(order => (
            <div key={order.id} className="bg-[#111] border border-white/5 p-8 md:p-12 animate-fadeIn hover:border-white/10 transition-colors">
              <div className="flex flex-col md:flex-row justify-between mb-8 gap-6 border-b border-white/5 pb-8">
                <div>
                  <p className="text-[#444] text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Order Identification</p>
                  <p className="text-white font-bold tracking-widest">{order.id}</p>
                </div>
                <div>
                  <p className="text-[#444] text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Transaction Date</p>
                  <p className="text-white font-bold tracking-widest">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[#444] text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Investment Total</p>
                  <p className="text-[#C9A84C] font-bold tracking-widest">${order.total}</p>
                </div>
                <div>
                  <span className="bg-green-900/20 text-green-500 text-[9px] uppercase tracking-[0.3em] font-bold px-4 py-1.5 border border-green-500/30">
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  {order.items.map((item, i) => {
                    const p = PRODUCTS.find(prod => prod.id === item.productId);
                    return (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="w-12 h-16 bg-[#0A0A0A]"><img src={p?.images[0]} className="w-full h-full object-cover" alt="" /></div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-widest">{p?.name}</p>
                          <p className="text-[9px] text-[#444] uppercase tracking-widest">Qty: {item.quantity} · Size: {item.size}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[#666] text-[10px] uppercase tracking-[0.2em] leading-loose font-bold">
                  <p className="text-white mb-2">Delivery Logisticts</p>
                  <p>{order.customer.name}</p>
                  <p>{order.customer.address}</p>
                  <p>{order.customer.phone}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Footer ---

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      MockBackend.subscribeNewsletter(email);
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail('');
    }, 1500);
  };

  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 pt-32 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="md:col-span-2">
            <h2 className="text-3xl serif text-white mb-8 tracking-tighter uppercase">Aurelius</h2>
            <p className="text-[#666] text-xs uppercase tracking-[0.3em] leading-loose max-w-sm mb-12 font-bold">
              Curating timeless artifacts for the modern gentleman since 2018. Handcrafted in our London atelier.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-[#444] hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-[#444] hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-[#444] hover:text-white transition-colors"><Facebook size={20} /></a>
            </div>
          </div>
          <div>
            <h3 className="text-white text-[10px] uppercase tracking-[0.4em] font-bold mb-10">Vertically Integrated</h3>
            <ul className="space-y-6 text-[#666] text-[9px] uppercase tracking-[0.2em] font-bold">
              <li><Link to="/shop/shoes" className="hover:text-[#C9A84C] transition-colors">Footwear</Link></li>
              <li><Link to="/shop/wallets" className="hover:text-[#C9A84C] transition-colors">Leather Goods</Link></li>
              <li><Link to="/shop/belts" className="hover:text-[#C9A84C] transition-colors">Waist Accessories</Link></li>
              <li><Link to="/shop/sunglasses" className="hover:text-[#C9A84C] transition-colors">Optics</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-[10px] uppercase tracking-[0.4em] font-bold mb-10">Client Concierge</h3>
            <ul className="space-y-6 text-[#666] text-[9px] uppercase tracking-[0.2em] font-bold">
              <li><Link to="/about" className="hover:text-[#C9A84C] transition-colors">Our Ethos</Link></li>
              <li><Link to="/contact" className="hover:text-[#C9A84C] transition-colors">Inquiry</Link></li>
              <li><Link to="/faq" className="hover:text-[#C9A84C] transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="bg-[#111] p-12 mb-24 border border-white/5">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-xl serif text-white mb-6 uppercase tracking-widest">Privé Access</h3>
            <p className="text-[#666] text-[10px] uppercase tracking-[0.4em] mb-10 font-bold">Join the inner circle for bespoke updates</p>
            <form onSubmit={handleSub} className="flex flex-col md:flex-row gap-4">
              <input 
                required
                type="email" 
                placeholder="Digital Mail" 
                className="flex-grow bg-[#0A0A0A] border-none text-xs text-white px-6 py-5 focus:ring-1 focus:ring-[#C9A84C] outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button 
                disabled={isSubmitting || isSuccess}
                className="bg-[#C9A84C] text-[#0A0A0A] px-12 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Syncing...' : isSuccess ? 'Welcome' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[8px] text-[#333] uppercase tracking-[0.6em] font-bold">© 2024 Aurelius Premium. All Rights Reserved.</p>
          <div className="flex gap-10 text-[8px] text-[#333] uppercase tracking-[0.4em] font-bold">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Engagement</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- App Root ---

const App = () => {
  const [cart, setCart] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem('aur_cart') || '[]'));
  const [wishlist, setWishlist] = useState<string[]>(() => MockBackend.getWishlist());

  useEffect(() => {
    localStorage.setItem('aur_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (productId: string, quantity = 1, size?: string) => {
    const product = PRODUCTS.find(p => p.id === productId);
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId && item.size === size);
      if (existing) return prev.map(item => item === existing ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, { productId, quantity, size }];
    });
  };

  const removeFromCart = (productId: string, size?: string) => setCart(prev => prev.filter(item => !(item.productId === productId && item.size === size)));
  const updateQuantity = (productId: string, quantity: number, size?: string) => setCart(prev => prev.map(item => (item.productId === productId && item.size === size) ? { ...item, quantity } : item));
  const clearCart = () => setCart([]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (PRODUCTS.find(p => p.id === item.productId)?.price || 0) * item.quantity, 0), [cart]);
  const itemCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const toggleWishlist = (productId: string) => {
    const newList = MockBackend.toggleWishlist(productId);
    setWishlist(newList);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount }}>
      <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col selection:bg-[#C9A84C] selection:text-[#0A0A0A]">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/:category" element={<ShopPage />} />
              <Route path="/shop/:category/:productId" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </WishlistContext.Provider>
    </CartContext.Provider>
  );
};

// Reuse existing detail/contact pages with Link updates
const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = useMemo(() => PRODUCTS.find(p => p.slug === productId) || PRODUCTS[0], [productId]);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [mainImage, setMainImage] = useState(product.images[0]);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState<Review[]>([]);
  const { addToCart } = useCart();
  const { toggleWishlist, wishlist } = useWishlist();

  useEffect(() => {
    setReviews(MockBackend.getReviews(product.id));
    setMainImage(product.images[0]);
    setSelectedSize(product.sizes?.[0] || '');
  }, [product]);

  const relatedProducts = useMemo(() => 
    PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4),
    [product]
  );

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-32">
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
          <div className="order-2 md:order-1 flex md:flex-col gap-4 overflow-x-auto no-scrollbar md:w-20 shrink-0">
            {product.images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setMainImage(img)} 
                className={`aspect-square w-16 md:w-full bg-[#111] border transition-colors flex-shrink-0 ${mainImage === img ? 'border-[#C9A84C]' : 'border-transparent'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
          <div className="order-1 md:order-2 flex-grow aspect-[4/5] bg-[#111] overflow-hidden">
            <img src={mainImage} className="w-full h-full object-cover animate-fadeIn" alt={product.name} />
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center">
          <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.5em] mb-4 font-bold">{product.category}</p>
          <h1 className="text-5xl serif mb-6 tracking-tight uppercase leading-none">{product.name}</h1>
          <p className="text-3xl font-light mb-12 tracking-wide">${product.price}</p>
          <p className="text-[#999] leading-relaxed mb-12 text-sm">{product.description}</p>

          {product.sizes && (
            <div className="mb-12">
              <label className="text-[10px] uppercase tracking-[0.3em] text-white font-bold block mb-6">Select Sizing</label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {product.sizes.map(size => (
                  <button 
                    key={size} 
                    onClick={() => setSelectedSize(size)} 
                    className={`py-4 border text-[11px] font-bold uppercase tracking-widest transition-all ${
                      selectedSize === size ? 'bg-white text-black border-white' : 'border-white/10 text-[#666] hover:border-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={() => addToCart(product.id, 1, selectedSize)} 
              className="flex-grow bg-[#C9A84C] text-[#0A0A0A] py-5 text-[10px] font-extrabold uppercase tracking-[0.3em] hover:bg-white transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <ShoppingBag size={18} /> Add To Cart
            </button>
            <button 
              onClick={() => toggleWishlist(product.id)}
              className={`px-6 border transition-all ${wishlist.includes(product.id) ? 'bg-white text-black border-white' : 'border-white/10 text-[#666] hover:border-white'}`}
            >
              <Heart size={20} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-32">
        <div className="flex gap-12 border-b border-white/5 mb-12">
          {['description', 'shipping'].map(t => (
            <button 
              key={t} 
              onClick={() => setActiveTab(t)} 
              className={`pb-4 text-[10px] uppercase tracking-[0.4em] font-bold transition-all ${
                activeTab === t ? 'text-[#C9A84C] border-b border-[#C9A84C]' : 'text-[#444] hover:text-[#C9A84C]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="animate-fadeIn min-h-[200px]">
          {activeTab === 'description' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
              <div>
                <h3 className="text-white uppercase tracking-[0.3em] text-xs font-bold mb-8 italic serif">Specifications</h3>
                <ul className="space-y-6 text-[#999] text-sm leading-relaxed">
                  {product.details.map((d, i) => <li key={i} className="flex items-start gap-4"><ChevronRight size={14} className="mt-1 text-[#C9A84C]" /> {d}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-white uppercase tracking-[0.3em] text-xs font-bold mb-8 italic serif">Origin</h3>
                <p className="text-[#999] text-sm leading-loose">{product.materials}</p>
              </div>
            </div>
          ) : (
            <p className="text-[#999] text-sm leading-loose max-w-2xl">White-glove delivery on all acquisitions exceeding $250. Insured worldwide transit via DHL Express. Estimated arrival: 3-7 business days depending on atelier backlog.</p>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-3xl serif uppercase tracking-tight">Complete The Look</h2>
            <div className="h-px bg-white/5 flex-grow mx-12 hidden md:block"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} onQuickView={() => {}} />)}
          </div>
        </section>
      )}
    </div>
  );
};

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-8 animate-fadeIn">
      <header className="text-center mb-20">
        <h1 className="text-5xl serif mb-4 tracking-tighter">Your Portfolio</h1>
        <div className="w-12 h-0.5 bg-[#C9A84C] mx-auto mb-8"></div>
      </header>
      
      {cart.length === 0 ? (
        <div className="text-center py-32 bg-[#111111] border border-white/5 max-w-2xl mx-auto">
          <p className="text-[#444] mb-12 italic serif text-2xl px-12">"Your portfolio is currently awaiting new acquisitions."</p>
          <Link to="/shop" className="bg-[#C9A84C] text-[#0A0A0A] px-16 py-5 text-[10px] uppercase tracking-[0.3em] font-extrabold hover:bg-white transition-all shadow-xl">Start Browsing</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          <div className="lg:col-span-8 divide-y divide-white/5 border-t border-white/5">
            {cart.map((item) => {
              const product = PRODUCTS.find(p => p.id === item.productId)!;
              return (
                <div key={`${item.productId}-${item.size}`} className="flex items-center gap-12 py-10 group animate-fadeIn">
                  <div className="w-24 h-32 bg-[#111] flex-shrink-0 overflow-hidden">
                    <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-[#C9A84C] text-[9px] uppercase tracking-[0.4em] mb-2 font-bold">{product.category}</p>
                    <h3 className="text-white text-base uppercase tracking-widest font-bold mb-2">{product.name}</h3>
                    <p className="text-[#444] text-[10px] uppercase tracking-[0.2em] mb-6 font-bold">Size: {item.size || 'N/A'}</p>
                    <div className="flex items-center gap-10">
                      <div className="flex items-center border border-white/10 text-xs">
                        <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.size)} className="px-5 py-3 text-[#444] hover:text-white transition-colors">-</button>
                        <span className="px-5 py-3 text-white font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size)} className="px-5 py-3 text-[#444] hover:text-white transition-colors">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.productId, item.size)} className="text-[10px] uppercase tracking-[0.3em] font-bold text-red-900/40 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-xl tracking-tight">${product.price * item.quantity}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="lg:col-span-4 h-fit sticky top-32">
            <div className="bg-[#111] p-12 border border-white/5 shadow-2xl">
              <h2 className="text-white uppercase tracking-[0.3em] text-xs font-bold mb-10 border-b border-white/5 pb-6">Ledger Summary</h2>
              <div className="space-y-6 mb-12">
                <div className="flex justify-between text-[#666] text-[10px] uppercase tracking-[0.2em] font-bold"><span>Subtotal</span><span className="text-white">${cartTotal}</span></div>
                <div className="flex justify-between text-[#666] text-[10px] uppercase tracking-[0.2em] font-bold"><span>Logistics</span><span className="text-green-800 uppercase italic">Complimentary</span></div>
                <div className="h-px bg-white/5 my-8"></div>
                <div className="flex justify-between text-white text-2xl serif"><span>Total</span><span className="text-[#C9A84C] font-bold">${cartTotal}</span></div>
              </div>
              <Link to="/checkout" className="block text-center bg-[#C9A84C] text-[#0A0A0A] py-6 text-[10px] font-extrabold uppercase tracking-[0.4em] hover:bg-white transition-all shadow-xl">Finalize Acquisition</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const [method, setMethod] = useState<'cod' | 'card'>('cod');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const order: Order = {
      id: `AUR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      items: cart,
      total: cartTotal,
      customer: {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
      },
      paymentMethod: method,
      date: new Date().toISOString(),
      status: 'processing'
    };

    setTimeout(() => {
      MockBackend.saveOrder(order);
      setSuccess(true);
      clearCart();
      setLoading(false);
    }, 2000);
  };

  if (success) return (
    <div className="pt-48 pb-48 text-center max-w-xl mx-auto px-4 animate-fadeIn">
      <CheckCircle size={100} strokeWidth={1} className="text-[#C9A84C] mx-auto mb-12 opacity-80" />
      <h1 className="text-6xl serif mb-8 tracking-tighter uppercase">Artisanship Initialized</h1>
      <p className="text-[#666] mb-16 leading-relaxed serif italic text-xl">"Your acquisition is being prepared by our lead artisans. A confirmation dispatch has been sent."</p>
      <Link to="/orders" className="bg-[#C9A84C] text-[#0A0A0A] px-16 py-6 text-[10px] font-extrabold uppercase tracking-[0.4em] hover:bg-white transition-all shadow-xl">View My Orders</Link>
    </div>
  );

  return (
    <div className="pt-40 pb-32 max-w-7xl mx-auto px-4 md:px-8">
      <h1 className="text-5xl serif mb-20 tracking-tighter uppercase text-center">Secure Finalization</h1>
      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-24">
        <div className="lg:col-span-7 space-y-12">
          <div className="bg-[#111] p-12 border border-white/5 space-y-10 shadow-2xl">
            <h2 className="text-white uppercase tracking-[0.3em] text-xs font-bold mb-10 border-b border-white/5 pb-6">1. Consignee Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input name="name" required className="w-full bg-[#0A0A0A] border-none text-white text-xs px-6 py-5 focus:ring-1 focus:ring-[#C9A84C] outline-none" placeholder="Full Name" />
              <input name="email" required type="email" className="w-full bg-[#0A0A0A] border-none text-white text-xs px-6 py-5 focus:ring-1 focus:ring-[#C9A84C] outline-none" placeholder="Email Interface" />
            </div>
            <input name="phone" required type="tel" className="w-full bg-[#0A0A0A] border-none text-white text-xs px-6 py-5 focus:ring-1 focus:ring-[#C9A84C] outline-none" placeholder="Contact Terminal" />
            <textarea name="address" required rows={3} className="w-full bg-[#0A0A0A] border-none text-white text-xs px-6 py-5 focus:ring-1 focus:ring-[#C9A84C] outline-none resize-none" placeholder="Delivery Destination"></textarea>
          </div>

          <div className="bg-[#111] p-12 border border-white/5 shadow-2xl">
            <h2 className="text-white uppercase tracking-[0.3em] text-xs font-bold mb-10 border-b border-white/5 pb-6">2. Settlement Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button type="button" onClick={() => setMethod('cod')} className={`p-8 border text-left flex items-center justify-between transition-all ${method === 'cod' ? 'border-[#C9A84C] bg-[#0A0A0A]' : 'border-white/5 hover:border-white/20'}`}>
                <div>
                  <p className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-2">Deferred</p>
                  <p className="text-[#444] text-[9px] uppercase tracking-widest font-bold">Cash On Delivery</p>
                </div>
                {method === 'cod' && <CheckCircle size={18} className="text-[#C9A84C]" />}
              </button>
              <button type="button" onClick={() => setMethod('card')} className={`p-8 border text-left flex items-center justify-between transition-all ${method === 'card' ? 'border-[#C9A84C] bg-[#0A0A0A]' : 'border-white/5 hover:border-white/20'}`}>
                <div>
                  <p className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-2">Instant</p>
                  <p className="text-[#444] text-[9px] uppercase tracking-widest font-bold">Card / Online</p>
                </div>
                {method === 'card' && <CheckCircle size={18} className="text-[#C9A84C]" />}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 h-fit sticky top-40">
          <div className="bg-[#111] p-12 border border-white/5 shadow-2xl">
            <h2 className="text-white uppercase tracking-[0.3em] text-xs font-bold mb-10 border-b border-white/5 pb-6">Portfolio Ledger</h2>
            <div className="space-y-6 max-h-[300px] overflow-y-auto no-scrollbar mb-10">
              {cart.map(item => {
                const p = PRODUCTS.find(prod => prod.id === item.productId)!;
                return (
                  <div key={`${item.productId}-${item.size}`} className="flex justify-between items-center text-xs group">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-16 bg-[#0A0A0A] overflow-hidden"><img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" /></div>
                      <div>
                        <p className="text-white font-bold uppercase tracking-widest mb-1 truncate max-w-[120px]">{p.name}</p>
                        <p className="text-[#444] uppercase tracking-widest font-bold text-[9px]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-white font-bold tracking-tighter">${p.price * item.quantity}</p>
                  </div>
                );
              })}
            </div>
            <div className="h-px bg-white/5 my-10"></div>
            <div className="flex justify-between text-2xl serif mb-12"><span>Total</span><span className="text-[#C9A84C] font-bold tracking-tighter">${cartTotal}</span></div>
            <button disabled={loading} type="submit" className="w-full bg-[#C9A84C] text-[#0A0A0A] py-6 text-[10px] font-extrabold uppercase tracking-[0.4em] hover:bg-white transition-all shadow-2xl flex items-center justify-center gap-4">
              {loading ? <Clock size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
              {loading ? 'Transmitting...' : 'Authorize Transaction'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const WhatsAppButton = () => (
  <a
    href="https://wa.me/1234567890?text=Greetings%20Aurelius%20Concierge%2C%20I%20have%20an%20inquiry%20regarding..."
    target="_blank"
    rel="noreferrer"
    className="fixed bottom-10 right-10 z-[150] bg-[#25D366] text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-transform duration-500 group"
  >
    <MessageCircle size={28} />
  </a>
);

const AboutPage = () => (
  <div className="pt-20">
    <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
      <img src="https://images.unsplash.com/photo-1441984969233-3f1350a67277?auto=format&fit=crop&q=80&w=2400" className="absolute inset-0 w-full h-full object-cover scale-105" alt="About" />
      <div className="absolute inset-0 bg-black/75"></div>
      <div className="relative z-10 text-center max-w-5xl px-4 animate-fadeIn">
        <h1 className="text-7xl md:text-[12rem] serif text-white mb-10 tracking-tighter leading-none">Heritage</h1>
        <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.8em] font-extrabold">London Atelier — Established 2018</p>
      </div>
    </section>
    <section className="py-40 px-4 md:px-8 max-w-4xl mx-auto text-center">
      <h2 className="text-5xl serif mb-16 tracking-tight">The Aurelius Ethos</h2>
      <p className="text-[#999] text-2xl leading-relaxed serif mb-12 italic">"Luxury is the culmination of discipline, patience, and an unwavering refusal to compromise on the smallest stitch."</p>
      <div className="w-16 h-px bg-[#C9A84C] mx-auto mb-16"></div>
      <p className="text-[#666] leading-loose text-sm uppercase tracking-[0.2em]">From our foundation in Savile Row, Aurelius has been dedicated to the preservation of traditional sartorial craftsmanship. We believe in pieces that outlive trends, becoming artifacts of a life well-lived.</p>
    </section>
  </div>
);

const FAQPage = () => (
  <div className="pt-48 pb-32 max-w-4xl mx-auto px-4 animate-fadeIn min-h-screen">
    <div className="text-center mb-24">
      <h1 className="text-6xl serif mb-6 tracking-tighter">Concierge</h1>
      <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.5em] font-bold">Frequently Asked Questions</p>
    </div>
    <div className="grid gap-10">
      {FAQS.map((faq: any, idx: number) => (
        <div key={idx} className="border border-white/5 p-12 bg-[#111] group hover:border-[#C9A84C]/40 transition-all shadow-xl">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#C9A84C] mb-6 font-bold">{faq.category}</p>
          <h3 className="text-lg font-bold uppercase tracking-widest mb-8 text-white serif">{faq.question}</h3>
          <p className="text-sm text-[#666] leading-loose italic serif">"{faq.answer}"</p>
        </div>
      ))}
    </div>
  </div>
);

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-48 pb-32 max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-32 animate-fadeIn">
      <div>
        <h1 className="text-7xl serif mb-10 tracking-tighter uppercase leading-none">Inquiry</h1>
        <p className="text-[#666] mb-16 uppercase tracking-[0.4em] text-[10px] leading-loose font-bold">Direct communication with our London atelier regarding bespoke acquisitions or order support.</p>
        <div className="space-y-12">
          <div className="group cursor-pointer">
            <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.3em] mb-4 font-extrabold group-hover:tracking-[0.5em] transition-all">Digital Mail</p>
            <p className="text-3xl text-white serif italic">concierge@aurelius.com</p>
          </div>
        </div>
      </div>
      <div className="bg-[#111] p-16 border border-white/5 relative shadow-2xl">
        {submitted ? (
          <div className="text-center py-20 animate-fadeIn">
            <CheckCircle size={64} strokeWidth={1} className="text-[#C9A84C] mx-auto mb-10 opacity-80" />
            <h2 className="text-3xl serif mb-6 tracking-tight uppercase">Transmission Received</h2>
            <p className="text-[#666] text-[10px] uppercase tracking-[0.4em] font-bold">Expect a response within one solar day.</p>
          </div>
        ) : (
          <form onSubmit={handleContact} className="space-y-10">
            <input required className="w-full bg-[#0A0A0A] border-none p-5 text-xs text-white focus:ring-1 focus:ring-[#C9A84C] outline-none" placeholder="Identity" />
            <input required className="w-full bg-[#0A0A0A] border-none p-5 text-xs text-white focus:ring-1 focus:ring-[#C9A84C] outline-none" placeholder="Subject" />
            <textarea required rows={5} className="w-full bg-[#0A0A0A] border-none p-5 text-xs text-white focus:ring-1 focus:ring-[#C9A84C] outline-none resize-none" placeholder="Narrative"></textarea>
            <button className="w-full bg-[#C9A84C] py-6 text-[10px] font-extrabold uppercase tracking-[0.4em] text-black hover:bg-white transition-all shadow-xl">Transmit Inquiry</button>
          </form>
        )}
      </div>
    </div>
  );
};

const NewsletterPopup = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('aur_popup_dismissed');
      if (!dismissed) setShow(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const handleSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      MockBackend.subscribeNewsletter(email);
      setSubscribed(true);
      setTimeout(() => {
        setShow(false);
        localStorage.setItem('aur_popup_dismissed', 'true');
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="bg-[#0A0A0A] border border-white/10 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden relative shadow-2xl">
        <button onClick={() => { setShow(false); localStorage.setItem('aur_popup_dismissed', 'true'); }} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-20"><X size={24} /></button>
        <div className="hidden md:block grayscale">
          <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60" alt="" />
        </div>
        <div className="p-16 flex flex-col justify-center items-center text-center">
          <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.6em] mb-6 font-extrabold">Privé Invitation</p>
          <h2 className="text-4xl serif mb-8 tracking-tight uppercase leading-tight">Claim Your Sartorial Edge</h2>
          {subscribed ? (
            <div className="py-10 animate-fadeIn"><CheckCircle size={48} strokeWidth={1} className="text-[#C9A84C] mx-auto mb-6" /><p className="text-[10px] uppercase tracking-[0.4em] text-white font-bold">Access Granted</p></div>
          ) : (
            <form onSubmit={handleSub} className="w-full space-y-5">
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Digital Terminal" className="w-full bg-[#111] border border-white/5 px-6 py-5 text-xs text-white text-center focus:ring-1 focus:ring-[#C9A84C] outline-none" />
              <button type="submit" className="w-full bg-[#C9A84C] text-[#0A0A0A] py-5 text-[10px] font-extrabold uppercase tracking-[0.4em] hover:bg-white transition-all">Submit Credentials</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
