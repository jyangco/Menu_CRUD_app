import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { Link } from "react-router-dom"

import { db } from "../config/firebase-config"
import Swal from "sweetalert2"


function ProductsPage() {
    const [ cart, setCart ] = useState([])
    const [ categories, setCategories ] = useState([])
    const [ joinedItems, setJoinedItems ] = useState([])
    const [ ctgry, setCtgry ] = useState("All")
    const categoryCollectionRef = collection(db, "category")
    const itemCollectionRef = collection(db, "item")
    const optionCollectionRef = collection(db, "options")

    useEffect(() => {
        //get category collection from database
        const getData = async() => {
            const  categorySnapshot = await getDocs(categoryCollectionRef)
            const categoryData = categorySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} ))
            //sort data of categories by id
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

            //get items collection from db
            const  itemSnapshot = await getDocs(itemCollectionRef)
            const items = (itemSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} )))

            //get options collection from db
            const optionSnapshot = await getDocs(optionCollectionRef)
            const optionsData = (optionSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} )))

            //get options with their respective item
            const optionsMap = optionsData.reduce((data, option) => {
                if (!data[option.item_id]) {
                    data[option.item_id] = []
                }
                data[option.item_id].push({
                    id: option.id,
                    option_name: option.option_name,
                    item_name: option.option_value,
                    price: option.price,
                    stock: option.stock,
                })

                console.log(data)
                return data
            }, {})

            //push everything into our state
            setJoinedItems(items.map(item => ({
                ...item,
                options: optionsMap[item.item_id] || null,
            })))
        } 
        getData()
    }, [])

    //add to cart function
    const addToCart = (product) => {
        const newCart = [...cart]
            //checking if item is already added
        const existingProductIndex = newCart.findIndex(item => item.id === product.id)
        if (existingProductIndex === -1) {
            newCart.push({ ...product, quantity: 1 })
        } else {
            newCart[existingProductIndex].quantity += 1
        }
        setCart(newCart)
    }

    // remove 1 item from the cart
    const subtractFromCart = (id) => {
        const newCart = [...cart]
        const existingProductIndex = newCart.findIndex(item => item.id === id)
        
        if (existingProductIndex !== -1) {
        if (newCart[existingProductIndex].quantity > 1) {
            newCart[existingProductIndex].quantity -= 1
        } else {
            // if the qty is 1, we just remove the item entirely
            newCart.splice(existingProductIndex, 1)
        }
        }
        setCart(newCart)
    }

    // remove item from cart
    const removeFromCart = (id) => {
        const newCart = cart.filter(item => item.id !== id)
        setCart(newCart)
    }

    // calculate total price
    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
    }

    //checkout alert
    const checkoutBtn = () => {
        Swal.fire({
            title: "Success",
            text: "Proceed to next customer",
            confirmButtonText: "OK",
            icon: "success"
        }).then((result) => {
            if (result.isConfirmed) {
                setCart([])
            }
        })
    }

    return(
        <div className="container mx-auto p-5">
            <div className="ribbon">
                <div className="text-center ribbon-content text-5xl font-mono italic font-extrabold mobile-lg:!text-2xl"> Restaurant Ordering App </div>
            </div>
            <div className="flex justify-between w-100">
                <div className="form-group mb-2 w-[100%]">
                    <label className="m-0 font-semibold italic"> Filter by Category: </label>
                    <select className="border border-black p-1"
                        onChange={(e) => setCtgry(e.target.value)}
                        value={ctgry}
                    >
                        <option value="All"> All </option>
                        {categories.map((val,ndx) => 
                            <option className="p-1" key={ndx} value={val.category_id}> {val.category_name} </option>
                        )}
                    </select>
                </div>
                <Link to="/new-product">
                    <button className="border p-2 bg-green-500 border-2 border-green-900 rounded">
                        <i className="far fa-plus-circle text-white"></i>
                    </button>
                </Link>
            </div>
            <div className="flex justify-between p-5">
                <div className="w-[70%] p-5 margin-auto">
                    {ctgry == "All" ?
                        categories.map((cat, ndx) => 
                            <div className="p-5" key={ndx}>
                                <div className="text-3xl text-center font-bold font-serif italic"> -{cat.category_name}- </div>
                                <div className="flex flex-wrap justify-start">
                                    {joinedItems.filter(item => item.category_id == cat.category_id).map((items, idx) => 
                                        <div key={idx} className="text-decoration-none text-black w-[25%] m-2">
                                            <div className="p-1 border-white border-2 rounded-3xl hover:!outline hover:!shadow-lg outline-stone-50">
                                                <div className="flex flex-col text-center">
                                                    <div className="text-3xl truncate my-2 w-[100%] font-bold font-sans"> {items.item_name} </div>
                                                    <div className="text-xl my-2 w-[100%] font-medium"> {items.description} </div>
                                                    <div className="text-2xl my-2 w-[100%] font-bold"> Php {items.price} </div>
                                                    <div className="flex justify-evenly my-2 text-base">
                                                        <Link to={`/product/${items.id}`} state={{ id: items.id }} className="p-1 border border-white w-20"> 
                                                            <i className="fal fa-edit"></i>
                                                        </Link>
                                                        <button onClick={() => addToCart(items)} className="p-1 border border-white w-20"> <i className="fal fa-cart-plus"></i> </button>
                                                    </div>
                                                    <span className="text-xl font-bold"> Options: </span>
                                                    {items.options === null ? <span className="text-base font-bold"> N/A </span> : 
                                                        items.options.map((option,ndx) => 
                                                            <div key={ndx} className="flex justify-evenly my-2 text-base">
                                                                <div className="text-base font-semibold py-1"> {option.item_name} </div>
                                                                <div className="text-base font-semibold py-1"> Php {option.price} </div>
                                                                <button onClick={() => addToCart(option)} className="p-1 border border-white w-fit"> <i className="fal fa-cart-plus"></i> </button>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : 
                        <div className="p-5">
                            {categories.filter(cat => cat.category_id == ctgry).map((cat, idx) => <div className="text-3xl text-center font-bold font-serif italic" key={idx}> -{cat.category_name}- </div> )}
                            <div className="flex flex-wrap justify-start">
                                {joinedItems.filter(item => item.category_id == ctgry).map((items, idx) => 
                                    <div key={idx} className="text-decoration-none text-black w-[25%] m-2">
                                        <div className="p-1 border-white border-2 rounded-3xl hover:!outline hover:!shadow-lg outline-stone-50">
                                            <div className="flex flex-col text-center">
                                                <div className="text-3xl truncate my-2 w-[100%] font-bold font-sans"> {items.item_name} </div>
                                                <div className="text-xl my-2 w-[100%] font-medium"> {items.description} </div>
                                                <div className="text-2xl my-2 w-[100%] font-bold"> Php {items.price} </div>
                                                <div className="flex justify-evenly my-2 text-base">
                                                    <Link to={`/product/${items.id}`} state={{ id: items.id }} className="p-1 border border-white w-20"> 
                                                        <i className="fal fa-edit"></i>
                                                    </Link>
                                                    <button onClick={() => addToCart(items)} className="p-1 border border-white w-20"> <i className="fal fa-cart-plus"></i> </button>
                                                </div>
                                                <span className="text-xl font-bold"> Options: </span>
                                                {items.options === null ? <span className="text-base font-bold"> N/A </span> : 
                                                    items.options.map((option,ndx) => 
                                                        <div key={ndx} className="flex justify-evenly my-2 text-base">
                                                            <div className="text-base font-semibold py-1"> {option.item_name} </div>
                                                            <div className="text-base font-semibold py-1"> Php {option.price} </div>
                                                            <button onClick={() => addToCart(option)} className="p-1 border border-white w-fit"> <i className="fal fa-cart-plus"></i> </button>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                </div>
                <div className="w-[30%] p-5 border-black border-l-2">
                    <div className="text-center font-bold text-xl"> Customer Order Sheet </div>
                    <ul className="list-none p-0">
                        {cart.map(item => 
                            <li className="mb-2 p-2 text-base font-semibold border-white border-b-2 flex justify-between" key={item.id}>
                                <div className="flex justify-between w-[70%]"> 
                                    <span className="truncate"> {item.quantity} x {item.item_name} </span>
                                    <span> Php {item.price} </span>
                                </div>
                                <div className="w-[15%] text-lg flex justify-between">
                                    <button onClick={() => subtractFromCart(item.id)} className="rounded-full" > <i className="far fa-minus-circle"></i> </button>
                                    <button onClick={() => removeFromCart(item.id)} className="rounded-full" > <i className="far fa-trash"></i> </button>
                                </div>
                            </li>
                        )}
                    </ul>
                    <div className="mt-5">
                        <div className="text-xl font-bold">Grand Total: Php {calculateTotal()}</div>
                        <button onClick={() => checkoutBtn()} className="p-3 mt-4 w-full bg-green-500 text-white border-0 font-semibold">Proceed to Check out</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductsPage