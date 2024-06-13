import { 
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom'

import ProductsPage from './pages/ProductsPage'
import NewProductPage from './pages/NewProductPage'
import EditProductPage from './pages/EditProductPage'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ProductsPage/>} />
                <Route path="/new-product" element={<NewProductPage/>} />
                <Route path="/product/:id" element={<EditProductPage/>} />
            </Routes>
        </Router>
    )
}

export default App
