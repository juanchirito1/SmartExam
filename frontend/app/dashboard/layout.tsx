import Sidebar from "@/components/dashboard/sidebar";
import Navbar from "@/components/dashboard/navbar";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <div className="flex min-h-screen">

      <Sidebar />


      <div className="flex-1">

        <Navbar />


        <main className="p-6 bg-gray-50 min-h-screen">

          {children}

        </main>

      </div>


    </div>

  );
}