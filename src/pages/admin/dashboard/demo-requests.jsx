import { useEffect, useState } from "react";

import DataTable, { AvatarCell, StatusBadge } from "@/components/DataTable";
import dbHelperApi from "@/api/dbHelperApi";

const columns = [
  { label: "Name", key: "name"},
  { label: "Email", key: "email"},
  { label: "Phone", key: "phone"},
  { label: "Role", key: "role"},
  { label: "Note", key: "note"},
  { label: "Clinic Name", key: "clinic_name"},
  { label: "Joined", key: "created_at"},
];

function DemoRequests() {
  const [requests, setRequests] = useState([]);

    useEffect(() => {
      const fetchDemoRequests = async () => {
        const response = await dbHelperApi.listDemoRequests();
        if(response.status === 200){
          setRequests(response.data.demo_requests);
        }
    };

      fetchDemoRequests();
    }, []);


    return(
         <DataTable
            title="Recent Requests"
            columns={columns}
            rows={requests}
            actionLabel="Contact Required"
            // onViewAll={() => setActive("doctors")}
            onAction={(doc) => window.alert("Contact Status Updated")}
        />
    )
}

export default DemoRequests;