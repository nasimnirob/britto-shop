// import Chart from "../../assets/chart/Chart";


const MainContent = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto space-y-6">

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1: Monthly Total Meals */}
                    <div className="bg-white p-4 rounded-lg shadow-md flex gap-2 text-start">
                        <h2 className="text-xl font-semibold">Monthly Total Meals:</h2>
                        <p className="text-2xl text-blue-600">0</p>
                    </div>

                    {/* Card 2: Today Meals */}
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex gap-2">
                            <h2 className="text-xl font-semibold">Today Meals:</h2>
                            <p className="text-2xl text-blue-600">0</p>
                        </div>
                        <div className="flex items-center gap-3 text-start">
                            <h2 className="text-xl font-semibold">Today Guest Meals:</h2>
                            <p className="text-2xl text-center text-blue-600">0</p>
                        </div>
                    </div>

                    {/* Card 3: Meal Rate */}
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex items-center text-center">
                            <div className="text-start flex flex-col">
                                <p className="font-semibold text-xl text-start">
                                    Set Today Meal Rate: <span className="text-blue-600">0</span>
                                </p>
                                <div className="flex bg-gray-200 rounded-md justify-center border items-center gap-2 mt-2">
                                    <input
                                        className="outline-none no-arrow w-3/4 h-8 border-none bg-gray-200 text-black cursor-pointer px-2"
                                        placeholder="Enter MR"
                                        type="number"
                                    />
                                    <button className="hover:text-black/80 px-2 py-0.5 items-center justify-center flex border bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white rounded-md mt-">
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Chart */}
                {/* <Chart /> */}

                {/* Today Meals Table */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Current Today Meals</h2>
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="px-4 py-2 text-left">Serial</th>
                                <th className="px-4 py-2 text-left">User</th>
                                <th className="px-4 py-2 text-left">Meal</th>
                                <th className="px-4 py-2 text-left">Guest</th>
                                <th className="px-4 py-2 text-left">Total Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* rows will be populated dynamically */}
                        </tbody>
                    </table>
                </div>

                {/* Today's Menu */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Today's Menu</h2>
                    <ul className="space-y-3">
                        <li>Breakfast: Pancakes, Eggs, and Toast</li>
                        <li>Lunch: Grilled Chicken, Rice, and Veggies</li>
                        <li>Snacks: Sandwiches and Fresh Juices</li>
                    </ul>
                </div>

                {/* Registered Users */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Registered Users</h2>
                    <ul className="space-y-3">
                        <li><b>Name</b>: User Name</li>
                        <li><b>Email</b>: user@email.com</li>
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default MainContent;