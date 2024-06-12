import React, { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"

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
                category_name: categories.find(category => category.id == item.category_id)?.category_name,
                options: optionsMap[item.id] || null
            })))
        } 
        getData()
    }, [])

    return(
        <div className="container mx-auto">
            {categories.map((cat, ndx) => 
                <div className="p-5" key={ndx}>
                    <div className="text-3xl"> {cat.category_name} </div>
                    {joinedItems.filter(item => item.category_id == cat.id).map((items, idx) => 
                        <div className="contents" key={idx}>
                            <p className="text-2xl"> {items.item_name} </p>
                            <p className="text-2xl"> {items.description} </p>
                            <p className="text-2xl"> {items.price} </p>
                            <p className="text-2xl"> {items.stock} </p>
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
                    )}
                </div>
            )}
        </div>
    )
}

export default ProductsPage