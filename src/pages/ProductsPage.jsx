import React, { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"

import { db } from "../config/firebase-config"


function ProductsPage() {
    const [ categories, setCategories ] = useState([])
    const [ items, setItems ] = useState([])
    const categoryCollectionRef = collection(db, 'category')
    const itemCollectionRef = collection(db, 'item')

    useEffect(() => {
        const getData = async() => {
            const data = await getDocs(categoryCollectionRef)
            setCategories(data.docs.map((doc) => ({...doc.data(), id: doc.id})))
        } 
        getData()
    }, [])

    return(
        <div className="container mx-auto">
            {categories.map((val, ndx) => 
                <div className="p-5" key={ndx}>
                    <div className="text-start text-5xl"> {val.id}. {val.category_name} </div>
                </div>
            )}
        </div>
    )
}

export default ProductsPage