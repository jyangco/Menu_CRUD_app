import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { Link } from 'react-router-dom'

import { db } from "../config/firebase-config"


function ProductsPage() {
    const [ categories, setCategories ] = useState([])
    const [ joinedItems, setJoinedItems ] = useState([])
    const [ ctgry, setCtgry ] = useState("All")
    const categoryCollectionRef = collection(db, 'category')
    const itemCollectionRef = collection(db, 'item')
    const optionCollectionRef = collection(db, 'options')

    useEffect(() => {
        const getData = async() => {
            const  categorySnapshot = await getDocs(categoryCollectionRef)
            const categoryData = categorySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} ))
            const sortedItems = [...categoryData].sort((a, b) => {
                if (a.category_id < b.category_id) {
                    return -1
                }
                if (a.category_id < b.category_id) {
                    return 1
                }
                return 0
            })
            setCategories(sortedItems)

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
                options: optionsMap[item.item_id] || null,
            })))
        } 
        getData()
    }, [])

    return(
        <div className="container mx-auto p-5">
            <div className="flex justify-between w-100">
                <div className="form-group mb-2 w-[100%]">
                    <label className='m-0'> Filter by Category: </label>
                    <select className='border p-1'
                        onChange={(e) => setCtgry(e.target.value)}
                        value={ctgry}
                    >
                        <option value="All"> All </option>
                        {categories.map((val,ndx) => 
                            <option className='p-1' key={ndx} value={val.category_id}> {val.category_name} </option>
                        )}
                    </select>
                </div>
                <Link to="/new-product">
                    <button className='border p-2 bg-green-500 rounded'>
                        <i className="far fa-plus-circle text-white"></i>
                    </button>
                </Link>
            </div>
            {ctgry == "All" ?
                categories.map((cat, ndx) => 
                    <div className="p-5" key={ndx}>
                        <div className="text-3xl"> {cat.category_name} </div>
                        <div className="flex flex-wrap">
                            {joinedItems.filter(item => item.category_id == cat.category_id).map((items, idx) => 
                                <Link key={idx} className="text-decoration-none text-black w-[50%]" to={`/product/${items.id}`} state={{ id: items.id }}>
                                    <div className="border-2 border-black m-2 p-3">
                                        <div className="text-2xl"> Item Name: <span className="font-bold"> {items.item_name} </span></div>
                                        <div className="text-2xl"> Item Description: <span className="font-bold"> {items.description} </span></div>
                                        <div className="text-2xl"> Item Price: <span className="font-bold"> {items.price} </span></div>
                                        <div className="text-2xl"> Item Stock: <span className="font-bold"> {items.stock} </span></div>
                                        {items.options != null ? 
                                            <div className="text-2xl">
                                                <div className="font-bold">Options:</div>
                                                <ul>
                                                    {items.options.map((option, indx) => 
                                                        <li className="text-2xl" key={indx}>
                                                            {option.option_name}: <span className="font-bold"> {option.option_value} </span> - Item Price: <span className="font-bold"> {option.price} </span> (Stock: {option.stock})
                                                        </li>
                                                    )}
                                                </ul>
                                            </div> : ""
                                        }
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                ) : 
                <div className="p-5">
                    {categories.filter(cat => cat.category_id == ctgry).map((cat, idx) => <span className="text-3xl" key={idx}> {cat.category_name} </span> )}
                    {joinedItems.filter(item => item.category_id == ctgry).map((items, idx) => 
                        <Link key={idx} className="text-decoration-none text-black" to={`/product/${items.id}`} state={{ id: items.id }}>
                            <div className="border-2 border-black m-2 p-3">
                                <div className="text-2xl"> Item Name: <span className="font-bold"> {items.item_name} </span></div>
                                <div className="text-2xl"> Item Description: <span className="font-bold"> {items.description} </span></div>
                                <div className="text-2xl"> Item Price: <span className="font-bold"> {items.price} </span></div>
                                <div className="text-2xl"> Item Stock: <span className="font-bold"> {items.stock} </span></div>
                                {items.options != null ? 
                                    <div className="text-2xl">
                                        <div className="font-bold">Options:</div>
                                        <ul>
                                            {items.options.map((option, indx) => 
                                                <li className="text-2xl" key={indx}>
                                                    {option.option_name}: <span className="font-bold"> {option.option_value} </span> - Item Price: <span className="font-bold"> {option.price} </span> (Stock: {option.stock})
                                                </li>
                                            )}
                                        </ul>
                                    </div> : ""
                                }
                            </div>
                        </Link>
                    )}
                </div>
            }
        </div>
    )
}

export default ProductsPage