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
            <div className="ribbon">
                <div className="text-center ribbon-content text-5xl font-mono italic font-extrabold mobile-lg:!text-2xl"> Restaurant Management App </div>
            </div>
            <div className="flex justify-between w-100">
                <div className="form-group mb-2 w-[100%]">
                    <label className='m-0 font-semibold italic'> Filter by Category: </label>
                    <select className='border border-black p-1'
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
                    <button className='border p-2 bg-green-500 border-2 border-green-900 rounded'>
                        <i className="far fa-plus-circle text-white"></i>
                    </button>
                </Link>
            </div>
            {ctgry == "All" ?
                categories.map((cat, ndx) => 
                    <div className="p-5" key={ndx}>
                        <div className="text-3xl text-center font-bold font-serif italic"> -{cat.category_name}- </div>
                            {joinedItems.filter(item => item.category_id == cat.category_id).map((items, idx) => 
                                <Link key={idx} className="text-decoration-none text-black" to={`/product/${items.id}`} state={{ id: items.id }}>
                                    <div className="border-b-2 border-black m-2 p-3 hover:!outline hover:!shadow-lg outline-stone-50">
                                        <div className="flex flex-wrap">
                                            <div className="flex flex-wrap w-[70%] mobile-lg:!w-[100%]">
                                                <div className="text-2xl w-[100%] font-bold font-sans"> {items.item_name} </div>
                                                <div className="text-xl w-[100%] font-medium"> {items.description} </div>
                                            </div>
                                            <div className="w-[10%] mobile-lg:!w-[100%] py-3">
                                                <div className="text-2xl w-[100%] font-bold"> Php {items.price} </div>
                                            </div>
                                            <div className="w-[20%] mobile-lg:!w-[100%] py-3">
                                                <div className="text-2xl w-[100%] font-bold"> {items.stock} items in stock </div>
                                            </div>
                                        </div>
                                        {items.options != null ? 
                                            <div className="pt-5">
                                                <div className="font-bold text-2xl">Options: <span className="font-normal text-xl"> *item also available in: </span> </div>
                                                <div className="flex flex-wrap justify-start">
                                                    {items.options.map((option, indx) => 
                                                        <div className="flex w-[60%] mobile-lg:!w-[100%]" key={indx}>
                                                            <div className="w-[33%]">
                                                                <div className="text-xl mobile-lg:!text-base w-[100%] font-semibold font-sans"> {option.option_name}: {option.option_value} </div>
                                                            </div>
                                                            <div className="w-[33%]">
                                                                <div className="text-xl mobile-lg:!text-base w-[100%] font-semibold"> Php {option.price} </div>
                                                            </div>
                                                            <div className="w-[33%]">
                                                                <div className="text-xl mobile-lg:!text-base w-[100%] font-semibold"> {option.stock} items in stock </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div> : ""
                                        }
                                    </div>
                                </Link>
                            )}
                    </div>
                ) : 
                <div className="p-5">
                    {categories.filter(cat => cat.category_id == ctgry).map((cat, idx) => <div className="text-3xl text-center font-bold font-serif italic" key={idx}> -{cat.category_name}- </div> )}
                    {joinedItems.filter(item => item.category_id == ctgry).map((items, idx) => 
                        <Link key={idx} className="text-decoration-none text-black" to={`/product/${items.id}`} state={{ id: items.id }}>
                            <div className="border-b-2 border-black m-2 p-3 hover:!outline hover:!shadow-lg outline-stone-50">
                                <div className="flex flex-wrap">
                                    <div className="flex flex-wrap w-[70% mobile-lg:!w-[100%]">
                                        <div className="text-2xl w-[100%] font-bold font-sans"> {items.item_name} </div>
                                        <div className="text-xl w-[100%] font-medium"> {items.description} </div>
                                    </div>
                                    <div className="w-[10%] mobile-lg:!w-[100%] py-3">
                                        <div className="text-2xl w-[100%] font-bold"> Php {items.price} </div>
                                    </div>
                                    <div className="w-[20%] mobile-lg:!w-[100%] py-3">
                                        <div className="text-2xl w-[100%] font-bold"> {items.stock} items in stock </div>
                                    </div>
                                </div>
                                {items.options != null ? 
                                    <div className="pt-5">
                                        <div className="font-bold text-2xl">Options: <span className="font-normal text-xl"> *item also available in: </span> </div>
                                        <div className="flex flex-wrap justify-start">
                                            {items.options.map((option, indx) => 
                                                <div className="flex w-[60%] mobile-lg:!w-[100%]" key={indx}>
                                                    <div className="w-[33%]">
                                                        <div className="text-xl mobile-lg:!text-base w-[100%] font-semibold font-sans"> {option.option_name}: {option.option_value} </div>
                                                    </div>
                                                    <div className="w-[33%]">
                                                        <div className="text-xl mobile-lg:!text-base w-[100%] font-semibold"> Php {option.price} </div>
                                                    </div>
                                                    <div className="w-[33%]">
                                                        <div className="text-xl mobile-lg:!text-base w-[100%] font-semibold"> {option.stock} items in stock </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
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