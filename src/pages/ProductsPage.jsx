import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { Link } from 'react-router-dom'

import { db } from "../config/firebase-config"


function ProductsPage() {
    const [ categories, setCategories ] = useState([])
    const [ joinedItems, setJoinedItems ] = useState([])
    const categoryCollectionRef = collection(db, 'category')
    const itemCollectionRef = collection(db, 'item')
    const optionCollectionRef = collection(db, 'options')

    useEffect(() => {
        const getData = async() => {
            const  categorySnapshot = await getDocs(categoryCollectionRef)
            setCategories(categorySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} )))

            const  itemSnapshot = await getDocs(itemCollectionRef)
            const items = (itemSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} )))

            const optionSnapshot = await getDocs(optionCollectionRef)
            const optionsData = (optionSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} )))

            const optionsMap = optionsData.reduce((data, option) => {
                if (!data[option.item_id]) {
                    data[option.item_id] = []
                }
                data[option.item_id].push({
                    option_name: option.option_name,
                    option_value: option.option_value,
                    price: option.price,
                    stock: option.stock
                })
                return data
            }, {})

            setJoinedItems(items.map(item => ({
                ...item,
                category_name: categories.find(category => category.category_id == item.category_id)?.category_name,
                options: optionsMap[item.id] || null
            })))
        } 
        getData()
    }, [])

    return(
        <div className="container mx-auto p-5">
            <div className="flex justify-end w-100">
                <Link to="/new-product">
                    <button className="p-2 border"> Add </button>
                </Link>
            </div>
            {categories.map((cat, ndx) => 
                <div className="p-5" key={ndx}>
                    <div className="text-3xl"> {cat.category_name} </div>
                    {joinedItems.filter(item => item.category_id == cat.category_id).map((items, idx) => 
                        <Link key={idx} className="text-decoration-none text-black" to={`/product/${items.id}`} state={{ id: items.id }}>
                            <div className="contents">
                                <div className="text-2xl"> Item Name: <span className="font-bold"> {items.item_name} </span></div>
                                <div className="text-2xl"> Item Description: <span className="font-bold"> {items.description} </span></div>
                                <div className="text-2xl"> Item Price: <span className="font-bold"> {items.price} </span></div>
                                <div className="text-2xl"> Item Stock: <span className="font-bold"> {items.stock} </span></div>
                                {items.options != null ? 
                                    <div className="text-xl">
                                        <h4>Options:</h4>
                                        <ul>
                                            {items.options.map((option, indx) => 
                                                <li key={indx}>
                                                    {option.option_name}: {option.option_value} - {option.price} (Stock: {option.stock})
                                                </li>
                                            )}
                                        </ul>
                                    </div> : ""
                                }
                            </div>
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}

export default ProductsPage