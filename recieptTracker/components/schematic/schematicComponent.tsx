import { getTemporaryAccessToken } from '@/actions/getTemporaryaccessToken';
import React from 'react'
import SchematicEmbed from './SchematicEmbed';

async function schematicComponent({componentId} : {componentId: string}) {
  // This component is a placeholder for the schematic component

  if (!componentId) {
    return null;
  }

  const accessToken = await getTemporaryAccessToken();

  if (!accessToken) {
    throw new Error('Failed to get temporary access token');
  }
  return (
    <div><SchematicEmbed accessToken={accessToken} componentId={componentId}/></div>
  )
}

export default schematicComponent