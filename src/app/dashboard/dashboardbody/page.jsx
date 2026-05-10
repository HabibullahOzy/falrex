import Link from "next/link";

export default function Dashbody() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Card */}
            <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 gap-4">
                <Link className="btn btn-sm btn-success" href={'/tryonvertually/favrics/shirt'}>Shirt</Link>
                {/* <Link className="btn btn-sm btn-success" href={'/tryonvertually/favrics/pant'}>Pant</Link> */}
                <Link className="btn btn-sm btn-success" href={'/tryonvertually/favrics/captryon'}>Cap</Link>
            
            
                <Link className="btn btn-sm btn-success" href={'/tryonvertually/sunglasstryon'}>sunglass</Link>
                <Link className="btn btn-sm btn-success" href={'/tryonvertually/juelarytryon/neclesstryon'}>Necless</Link>
                <Link className="btn btn-sm btn-success" href={'/tryonvertually/juelarytryon/noseringtryon'}>NoseRing</Link>
                <Link className="btn btn-sm btn-success" href={'/tryonvertually/juelarytryon/earRingtry'}>EarRing</Link>
                <Link className="btn btn-sm btn-success" href={'/tryonvertually/juelarytryon/crowntryon'}>Crown</Link>
            </div>

            {/* Add more cards as needed */}
        </div>
    </div>
    );
}