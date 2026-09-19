import React, { useState } from 'react'
import { useSiteSettings } from '../../Context/SiteSettingsContext';

const SiteSettings = () => {
  const { coverEnabled, setCoverEnabled } = useSiteSettings();

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h2 className=" px-4 py-1 text-2xl font-semibold bg-gray-50 shadow-md text-gray-700 dark:text-white border-b dark:border-gray-700">Site Settings</h2>
      </div>

      <div className='px-4 '>
        <div className="flex items-center justify-between border-b dark:border-gray-700 pb-4">
          <div>
            <p className="font-medium text-gray-700 dark:text-white">Page Cover</p>
            <p className="text-sm text-gray-400">Category page এ cover image দেখাবে</p>
          </div>
          <input
            type="checkbox"
            className="toggle  bg-black/80 hover:bg-black/90 text-white p-1"
            checked={coverEnabled}
            onChange={() => setCoverEnabled(!coverEnabled)}
          />
        </div>

      </div>
    </div>
  )
}

export default SiteSettings