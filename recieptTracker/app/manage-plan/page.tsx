import React from 'react'
import SchematicComponent from "@/components/schematic/schematicComponent";

function ManagePlan() {
  return (
    <div className='container xl:max-w-5xl mx-auto p-4 md:p-0'>
      <h1 className='text-2xl font-bold mb-4 my-8'>Manage Plan</h1>
      <p className='text-gray-600 mb-4'>
        Manage your plan and billing details here. You can upgrade, downgrade, or cancel your subscription at any time. 
        For any issues, please contact support.
      </p>
        <SchematicComponent 
          componentId={process.env.NEXT_PUBLIC_SCHEMATIC_CUSTOMEER_PORTAL_COMPONENT_ID || ""}
        />
    </div>
  );
}

export default ManagePlan