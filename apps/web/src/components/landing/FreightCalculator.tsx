import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Truck, Snowflake, Package, ArrowRight, Info } from 'lucide-react';

interface FreightCalculatorProps {
  /** Default origin city name */
  defaultOrigin?: string;
  /** Default destination city name */
  defaultDestination?: string;
  /** Default distance in miles (if known) */
  defaultDistance?: number;
  /** Base dry van rate per mile */
  dryVanRatePerMile?: number;
  /** Reefer premium percentage over dry van */
  reeferPremiumPercent?: number;
  /** Current fuel surcharge percentage */
  fuelSurchargePercent?: number;
  /** Current diesel price per gallon */
  dieselPrice?: number;
}

// Comprehensive ZIP code prefix to approximate coordinates (first 3 digits)
// Covers all major US regions for accurate distance estimates
const ZIP_REGIONS: Record<string, { lat: number; lng: number; city: string }> = {
  // Northeast
  '100': { lat: 40.7128, lng: -74.006, city: 'New York, NY' },
  '101': { lat: 40.7128, lng: -74.006, city: 'New York, NY' },
  '102': { lat: 40.7128, lng: -74.006, city: 'New York, NY' },
  '103': { lat: 40.5795, lng: -74.1502, city: 'Staten Island, NY' },
  '104': { lat: 40.8448, lng: -73.8648, city: 'Bronx, NY' },
  '110': { lat: 40.6892, lng: -73.8128, city: 'Queens, NY' },
  '111': { lat: 40.6501, lng: -73.9496, city: 'Brooklyn, NY' },
  '112': { lat: 40.6892, lng: -73.9442, city: 'Brooklyn, NY' },
  '070': { lat: 40.7357, lng: -74.1724, city: 'Newark, NJ' },
  '080': { lat: 40.2206, lng: -74.7597, city: 'Trenton, NJ' },
  '191': { lat: 39.9526, lng: -75.1652, city: 'Philadelphia, PA' },
  '021': { lat: 42.3601, lng: -71.0589, city: 'Boston, MA' },
  '022': { lat: 42.3601, lng: -71.0589, city: 'Boston, MA' },
  '060': { lat: 41.7658, lng: -72.6734, city: 'Hartford, CT' },
  '152': { lat: 40.4406, lng: -79.9959, city: 'Pittsburgh, PA' },
  '212': { lat: 39.2904, lng: -76.6122, city: 'Baltimore, MD' },
  '200': { lat: 38.9072, lng: -77.0369, city: 'Washington, DC' },
  '201': { lat: 38.9072, lng: -77.0369, city: 'Washington, DC' },
  '220': { lat: 38.8816, lng: -77.0910, city: 'Arlington, VA' },
  '223': { lat: 38.8462, lng: -77.3064, city: 'Alexandria, VA' },

  // Southeast (expanded)
  '303': { lat: 33.749, lng: -84.388, city: 'Atlanta, GA' },
  '300': { lat: 33.749, lng: -84.388, city: 'Atlanta, GA' },
  '301': { lat: 33.749, lng: -84.388, city: 'Atlanta, GA' },
  '302': { lat: 33.749, lng: -84.388, city: 'Atlanta, GA' },
  '304': { lat: 33.4735, lng: -82.0105, city: 'Augusta, GA' },
  '310': { lat: 32.0809, lng: -81.0912, city: 'Savannah, GA' },
  '314': { lat: 32.083, lng: -81.099, city: 'Savannah, GA' },
  '315': { lat: 32.0809, lng: -81.0912, city: 'Savannah, GA' },
  '316': { lat: 32.8407, lng: -83.6324, city: 'Macon, GA' },
  '317': { lat: 31.5785, lng: -84.1557, city: 'Albany, GA' },
  '318': { lat: 32.4610, lng: -84.9877, city: 'Columbus, GA' },
  '372': { lat: 36.162, lng: -86.781, city: 'Nashville, TN' },
  '370': { lat: 36.162, lng: -86.781, city: 'Nashville, TN' },
  '371': { lat: 36.162, lng: -86.781, city: 'Nashville, TN' },
  '373': { lat: 35.9606, lng: -83.9207, city: 'Knoxville, TN' },
  '374': { lat: 35.0456, lng: -85.3097, city: 'Chattanooga, TN' },
  '379': { lat: 35.960, lng: -83.920, city: 'Knoxville, TN' },
  '380': { lat: 35.1495, lng: -90.0490, city: 'Memphis, TN' },
  '381': { lat: 35.149, lng: -90.048, city: 'Memphis, TN' },
  '352': { lat: 33.520, lng: -86.802, city: 'Birmingham, AL' },
  '350': { lat: 33.520, lng: -86.802, city: 'Birmingham, AL' },
  '351': { lat: 33.520, lng: -86.802, city: 'Birmingham, AL' },
  '354': { lat: 33.209, lng: -87.5692, city: 'Tuscaloosa, AL' },
  '356': { lat: 34.7304, lng: -86.5861, city: 'Huntsville, AL' },
  '360': { lat: 32.3792, lng: -86.3077, city: 'Montgomery, AL' },
  '365': { lat: 30.6954, lng: -88.0399, city: 'Mobile, AL' },
  '282': { lat: 35.227, lng: -80.843, city: 'Charlotte, NC' },
  '280': { lat: 35.227, lng: -80.843, city: 'Charlotte, NC' },
  '281': { lat: 35.227, lng: -80.843, city: 'Charlotte, NC' },
  '270': { lat: 36.0999, lng: -79.8320, city: 'Greensboro, NC' },
  '272': { lat: 35.7796, lng: -78.6382, city: 'Raleigh, NC' },
  '275': { lat: 35.7796, lng: -78.6382, city: 'Raleigh, NC' },
  '276': { lat: 35.779, lng: -78.638, city: 'Raleigh, NC' },
  '277': { lat: 36.0726, lng: -79.7920, city: 'Durham, NC' },
  '284': { lat: 35.5951, lng: -82.5515, city: 'Asheville, NC' },
  '285': { lat: 34.2257, lng: -77.9447, city: 'Wilmington, NC' },
  '290': { lat: 33.998, lng: -81.0348, city: 'Columbia, SC' },
  '292': { lat: 33.998, lng: -81.0348, city: 'Columbia, SC' },
  '293': { lat: 34.8526, lng: -82.3940, city: 'Greenville, SC' },
  '294': { lat: 32.776, lng: -79.931, city: 'Charleston, SC' },
  '295': { lat: 32.776, lng: -79.931, city: 'Charleston, SC' },
  '296': { lat: 34.8526, lng: -82.3940, city: 'Greenville, SC' },
  '320': { lat: 30.332, lng: -81.655, city: 'Jacksonville, FL' },
  '321': { lat: 30.332, lng: -81.655, city: 'Jacksonville, FL' },
  '322': { lat: 30.332, lng: -81.655, city: 'Jacksonville, FL' },
  '323': { lat: 30.4383, lng: -84.2807, city: 'Tallahassee, FL' },
  '324': { lat: 30.2672, lng: -81.3962, city: 'Panama City, FL' },
  '325': { lat: 30.4213, lng: -87.2169, city: 'Pensacola, FL' },
  '326': { lat: 29.6516, lng: -82.3248, city: 'Gainesville, FL' },
  '327': { lat: 28.9012, lng: -81.2637, city: 'Daytona Beach, FL' },
  '328': { lat: 28.538, lng: -81.379, city: 'Orlando, FL' },
  '329': { lat: 28.538, lng: -81.379, city: 'Orlando, FL' },
  '330': { lat: 25.761, lng: -80.191, city: 'Miami, FL' },
  '331': { lat: 25.761, lng: -80.191, city: 'Miami, FL' },
  '332': { lat: 25.761, lng: -80.191, city: 'Miami, FL' },
  '333': { lat: 26.1224, lng: -80.1373, city: 'Fort Lauderdale, FL' },
  '334': { lat: 26.7153, lng: -80.0534, city: 'West Palm Beach, FL' },
  '335': { lat: 27.950, lng: -82.457, city: 'Tampa, FL' },
  '336': { lat: 27.950, lng: -82.457, city: 'Tampa, FL' },
  '337': { lat: 27.3364, lng: -82.5307, city: 'Sarasota, FL' },
  '338': { lat: 28.0395, lng: -81.9498, city: 'Lakeland, FL' },
  '339': { lat: 26.6406, lng: -81.8723, city: 'Fort Myers, FL' },
  '341': { lat: 26.6406, lng: -81.8723, city: 'Fort Myers, FL' },

  // Gulf Coast / Texas
  '700': { lat: 29.951, lng: -90.071, city: 'New Orleans, LA' },
  '701': { lat: 29.951, lng: -90.071, city: 'New Orleans, LA' },
  '704': { lat: 30.2241, lng: -92.0198, city: 'Lafayette, LA' },
  '706': { lat: 32.5093, lng: -93.7501, city: 'Shreveport, LA' },
  '708': { lat: 30.4515, lng: -91.1871, city: 'Baton Rouge, LA' },
  '770': { lat: 29.7604, lng: -95.3698, city: 'Houston, TX' },
  '772': { lat: 29.7604, lng: -95.3698, city: 'Houston, TX' },
  '773': { lat: 29.7604, lng: -95.3698, city: 'Houston, TX' },
  '774': { lat: 29.7604, lng: -95.3698, city: 'Houston, TX' },
  '775': { lat: 29.7604, lng: -95.3698, city: 'Houston, TX' },
  '750': { lat: 32.7767, lng: -96.7970, city: 'Dallas, TX' },
  '751': { lat: 32.7767, lng: -96.7970, city: 'Dallas, TX' },
  '752': { lat: 32.7555, lng: -97.3308, city: 'Fort Worth, TX' },
  '760': { lat: 32.7555, lng: -97.3308, city: 'Fort Worth, TX' },
  '761': { lat: 32.7555, lng: -97.3308, city: 'Fort Worth, TX' },
  '780': { lat: 29.4241, lng: -98.4936, city: 'San Antonio, TX' },
  '781': { lat: 29.4241, lng: -98.4936, city: 'San Antonio, TX' },
  '782': { lat: 29.4241, lng: -98.4936, city: 'San Antonio, TX' },
  '786': { lat: 30.2672, lng: -97.7431, city: 'Austin, TX' },
  '787': { lat: 30.2672, lng: -97.7431, city: 'Austin, TX' },
  '790': { lat: 35.2220, lng: -101.8313, city: 'Amarillo, TX' },
  '791': { lat: 35.2220, lng: -101.8313, city: 'Amarillo, TX' },
  '793': { lat: 33.5779, lng: -101.8552, city: 'Lubbock, TX' },
  '794': { lat: 33.5779, lng: -101.8552, city: 'Lubbock, TX' },
  '797': { lat: 31.7619, lng: -106.4850, city: 'El Paso, TX' },
  '798': { lat: 31.7619, lng: -106.4850, city: 'El Paso, TX' },
  '799': { lat: 31.7619, lng: -106.4850, city: 'El Paso, TX' },
  '390': { lat: 32.2988, lng: -90.1848, city: 'Jackson, MS' },
  '391': { lat: 32.2988, lng: -90.1848, city: 'Jackson, MS' },
  '392': { lat: 32.2988, lng: -90.1848, city: 'Jackson, MS' },
  '393': { lat: 31.3271, lng: -89.2903, city: 'Hattiesburg, MS' },
  '394': { lat: 30.3960, lng: -88.8853, city: 'Biloxi, MS' },
  '395': { lat: 30.3960, lng: -88.8853, city: 'Gulfport, MS' },
  '716': { lat: 34.746, lng: -92.289, city: 'Little Rock, AR' },
  '720': { lat: 34.746, lng: -92.289, city: 'Little Rock, AR' },
  '721': { lat: 34.746, lng: -92.289, city: 'Little Rock, AR' },
  '722': { lat: 34.746, lng: -92.289, city: 'Little Rock, AR' },

  // Midwest
  '402': { lat: 38.252, lng: -85.758, city: 'Louisville, KY' },
  '400': { lat: 38.252, lng: -85.758, city: 'Louisville, KY' },
  '401': { lat: 38.252, lng: -85.758, city: 'Louisville, KY' },
  '403': { lat: 38.0406, lng: -84.5037, city: 'Lexington, KY' },
  '405': { lat: 38.0406, lng: -84.5037, city: 'Lexington, KY' },
  '430': { lat: 39.9612, lng: -82.9988, city: 'Columbus, OH' },
  '431': { lat: 39.9612, lng: -82.9988, city: 'Columbus, OH' },
  '432': { lat: 39.9612, lng: -82.9988, city: 'Columbus, OH' },
  '440': { lat: 41.4993, lng: -81.6944, city: 'Cleveland, OH' },
  '441': { lat: 41.4993, lng: -81.6944, city: 'Cleveland, OH' },
  '442': { lat: 41.0814, lng: -81.5190, city: 'Akron, OH' },
  '450': { lat: 39.1031, lng: -84.5120, city: 'Cincinnati, OH' },
  '451': { lat: 39.1031, lng: -84.5120, city: 'Cincinnati, OH' },
  '452': { lat: 39.1031, lng: -84.5120, city: 'Cincinnati, OH' },
  '453': { lat: 39.7589, lng: -84.1916, city: 'Dayton, OH' },
  '454': { lat: 39.7589, lng: -84.1916, city: 'Dayton, OH' },
  '455': { lat: 39.7589, lng: -84.1916, city: 'Dayton, OH' },
  '460': { lat: 39.7684, lng: -86.1581, city: 'Indianapolis, IN' },
  '461': { lat: 39.7684, lng: -86.1581, city: 'Indianapolis, IN' },
  '462': { lat: 39.7684, lng: -86.1581, city: 'Indianapolis, IN' },
  '463': { lat: 39.7684, lng: -86.1581, city: 'Indianapolis, IN' },
  '464': { lat: 39.7684, lng: -86.1581, city: 'Indianapolis, IN' },
  '465': { lat: 39.7684, lng: -86.1581, city: 'Indianapolis, IN' },
  '466': { lat: 41.0793, lng: -85.1394, city: 'Fort Wayne, IN' },
  '467': { lat: 41.0793, lng: -85.1394, city: 'Fort Wayne, IN' },
  '468': { lat: 41.0793, lng: -85.1394, city: 'Fort Wayne, IN' },
  '600': { lat: 41.8781, lng: -87.6298, city: 'Chicago, IL' },
  '601': { lat: 41.8781, lng: -87.6298, city: 'Chicago, IL' },
  '602': { lat: 41.8781, lng: -87.6298, city: 'Chicago, IL' },
  '603': { lat: 42.0334, lng: -87.8834, city: 'Oak Park, IL' },
  '604': { lat: 42.0451, lng: -87.6877, city: 'Evanston, IL' },
  '605': { lat: 42.0451, lng: -87.6877, city: 'Evanston, IL' },
  '606': { lat: 41.8781, lng: -87.6298, city: 'Chicago, IL' },
  '610': { lat: 41.5236, lng: -90.5776, city: 'Rock Island, IL' },
  '617': { lat: 40.6936, lng: -89.5890, city: 'Peoria, IL' },
  '618': { lat: 40.6936, lng: -89.5890, city: 'Peoria, IL' },
  '619': { lat: 40.6936, lng: -89.5890, city: 'Peoria, IL' },
  '620': { lat: 39.7817, lng: -89.6501, city: 'Springfield, IL' },
  '622': { lat: 38.6270, lng: -90.1994, city: 'St. Louis, MO' },
  '623': { lat: 38.6270, lng: -90.1994, city: 'St. Louis, MO' },
  '630': { lat: 38.6270, lng: -90.1994, city: 'St. Louis, MO' },
  '631': { lat: 38.6270, lng: -90.1994, city: 'St. Louis, MO' },
  '640': { lat: 39.0997, lng: -94.5786, city: 'Kansas City, MO' },
  '641': { lat: 39.0997, lng: -94.5786, city: 'Kansas City, MO' },
  '660': { lat: 39.0997, lng: -94.5786, city: 'Kansas City, KS' },
  '661': { lat: 39.0997, lng: -94.5786, city: 'Kansas City, KS' },
  '480': { lat: 42.3314, lng: -83.0458, city: 'Detroit, MI' },
  '481': { lat: 42.3314, lng: -83.0458, city: 'Detroit, MI' },
  '482': { lat: 42.3314, lng: -83.0458, city: 'Detroit, MI' },
  '483': { lat: 42.3314, lng: -83.0458, city: 'Detroit, MI' },
  '484': { lat: 43.0125, lng: -83.6875, city: 'Flint, MI' },
  '485': { lat: 43.0125, lng: -83.6875, city: 'Flint, MI' },
  '486': { lat: 43.4799, lng: -83.9806, city: 'Saginaw, MI' },
  '487': { lat: 43.4799, lng: -83.9806, city: 'Saginaw, MI' },
  '488': { lat: 42.7325, lng: -84.5555, city: 'Lansing, MI' },
  '489': { lat: 42.7325, lng: -84.5555, city: 'Lansing, MI' },
  '490': { lat: 42.2917, lng: -85.5872, city: 'Kalamazoo, MI' },
  '491': { lat: 42.2917, lng: -85.5872, city: 'Kalamazoo, MI' },
  '492': { lat: 42.9634, lng: -85.6681, city: 'Grand Rapids, MI' },
  '493': { lat: 42.9634, lng: -85.6681, city: 'Grand Rapids, MI' },
  '494': { lat: 42.9634, lng: -85.6681, city: 'Grand Rapids, MI' },
  '495': { lat: 42.9634, lng: -85.6681, city: 'Grand Rapids, MI' },
  '530': { lat: 43.0389, lng: -87.9065, city: 'Milwaukee, WI' },
  '531': { lat: 43.0389, lng: -87.9065, city: 'Milwaukee, WI' },
  '532': { lat: 43.0389, lng: -87.9065, city: 'Milwaukee, WI' },
  '534': { lat: 42.7261, lng: -87.7828, city: 'Racine, WI' },
  '535': { lat: 43.0731, lng: -89.4012, city: 'Madison, WI' },
  '537': { lat: 43.0731, lng: -89.4012, city: 'Madison, WI' },
  '540': { lat: 44.5192, lng: -88.0198, city: 'Green Bay, WI' },
  '550': { lat: 44.9778, lng: -93.2650, city: 'Minneapolis, MN' },
  '551': { lat: 44.9537, lng: -93.0900, city: 'St. Paul, MN' },
  '553': { lat: 44.9778, lng: -93.2650, city: 'Minneapolis, MN' },
  '554': { lat: 44.9778, lng: -93.2650, city: 'Minneapolis, MN' },
  '555': { lat: 44.9778, lng: -93.2650, city: 'Minneapolis, MN' },
  '680': { lat: 41.2565, lng: -95.9345, city: 'Omaha, NE' },
  '681': { lat: 41.2565, lng: -95.9345, city: 'Omaha, NE' },
  '500': { lat: 41.5868, lng: -93.6250, city: 'Des Moines, IA' },
  '501': { lat: 41.5868, lng: -93.6250, city: 'Des Moines, IA' },
  '503': { lat: 41.5868, lng: -93.6250, city: 'Des Moines, IA' },

  // Mountain / West
  '800': { lat: 39.7392, lng: -104.9903, city: 'Denver, CO' },
  '801': { lat: 39.7392, lng: -104.9903, city: 'Denver, CO' },
  '802': { lat: 39.7392, lng: -104.9903, city: 'Denver, CO' },
  '803': { lat: 39.7392, lng: -104.9903, city: 'Denver, CO' },
  '804': { lat: 39.7392, lng: -104.9903, city: 'Denver, CO' },
  '805': { lat: 39.7392, lng: -104.9903, city: 'Denver, CO' },
  '806': { lat: 39.7392, lng: -104.9903, city: 'Denver, CO' },
  '808': { lat: 38.8339, lng: -104.8214, city: 'Colorado Springs, CO' },
  '809': { lat: 38.8339, lng: -104.8214, city: 'Colorado Springs, CO' },
  '850': { lat: 33.4484, lng: -112.0740, city: 'Phoenix, AZ' },
  '852': { lat: 33.4484, lng: -112.0740, city: 'Phoenix, AZ' },
  '853': { lat: 33.4484, lng: -112.0740, city: 'Phoenix, AZ' },
  '856': { lat: 32.2226, lng: -110.9747, city: 'Tucson, AZ' },
  '857': { lat: 32.2226, lng: -110.9747, city: 'Tucson, AZ' },
  '870': { lat: 35.0844, lng: -106.6504, city: 'Albuquerque, NM' },
  '871': { lat: 35.0844, lng: -106.6504, city: 'Albuquerque, NM' },
  '873': { lat: 35.6869, lng: -105.9378, city: 'Santa Fe, NM' },
  '840': { lat: 40.7608, lng: -111.8910, city: 'Salt Lake City, UT' },
  '841': { lat: 40.7608, lng: -111.8910, city: 'Salt Lake City, UT' },
  '890': { lat: 36.1699, lng: -115.1398, city: 'Las Vegas, NV' },
  '891': { lat: 36.1699, lng: -115.1398, city: 'Las Vegas, NV' },
  '893': { lat: 36.1699, lng: -115.1398, city: 'Las Vegas, NV' },
  '894': { lat: 39.5296, lng: -119.8138, city: 'Reno, NV' },
  '895': { lat: 39.5296, lng: -119.8138, city: 'Reno, NV' },

  // Pacific
  '900': { lat: 34.0522, lng: -118.2437, city: 'Los Angeles, CA' },
  '901': { lat: 34.0522, lng: -118.2437, city: 'Los Angeles, CA' },
  '902': { lat: 33.9425, lng: -118.4081, city: 'Inglewood, CA' },
  '903': { lat: 33.9425, lng: -118.4081, city: 'Inglewood, CA' },
  '904': { lat: 33.7701, lng: -118.1937, city: 'Long Beach, CA' },
  '905': { lat: 33.8358, lng: -118.3406, city: 'Torrance, CA' },
  '906': { lat: 33.8358, lng: -118.3406, city: 'Torrance, CA' },
  '907': { lat: 33.8358, lng: -118.3406, city: 'Torrance, CA' },
  '908': { lat: 33.7701, lng: -118.1937, city: 'Long Beach, CA' },
  '910': { lat: 34.1478, lng: -118.1445, city: 'Pasadena, CA' },
  '911': { lat: 34.1478, lng: -118.1445, city: 'Pasadena, CA' },
  '912': { lat: 34.1808, lng: -118.3089, city: 'Glendale, CA' },
  '913': { lat: 34.1808, lng: -118.3089, city: 'Glendale, CA' },
  '914': { lat: 34.2011, lng: -118.5714, city: 'Van Nuys, CA' },
  '915': { lat: 34.2011, lng: -118.5714, city: 'Burbank, CA' },
  '916': { lat: 34.2011, lng: -118.5714, city: 'North Hollywood, CA' },
  '917': { lat: 34.0211, lng: -118.3965, city: 'Culver City, CA' },
  '918': { lat: 34.0211, lng: -118.3965, city: 'Culver City, CA' },
  '920': { lat: 32.7157, lng: -117.1611, city: 'San Diego, CA' },
  '921': { lat: 32.7157, lng: -117.1611, city: 'San Diego, CA' },
  '922': { lat: 32.7157, lng: -117.1611, city: 'San Diego, CA' },
  '923': { lat: 33.6846, lng: -117.8265, city: 'Irvine, CA' },
  '925': { lat: 33.6846, lng: -117.8265, city: 'Irvine, CA' },
  '926': { lat: 33.7175, lng: -117.8311, city: 'Santa Ana, CA' },
  '927': { lat: 33.7175, lng: -117.8311, city: 'Santa Ana, CA' },
  '928': { lat: 33.8353, lng: -117.9145, city: 'Anaheim, CA' },
  '930': { lat: 34.4208, lng: -119.6982, city: 'Santa Barbara, CA' },
  '931': { lat: 34.4208, lng: -119.6982, city: 'Santa Barbara, CA' },
  '932': { lat: 34.2694, lng: -118.7815, city: 'Oxnard, CA' },
  '933': { lat: 34.2694, lng: -118.7815, city: 'Oxnard, CA' },
  '934': { lat: 33.9533, lng: -117.3962, city: 'Riverside, CA' },
  '935': { lat: 34.1083, lng: -117.2898, city: 'San Bernardino, CA' },
  '936': { lat: 36.7378, lng: -119.7871, city: 'Fresno, CA' },
  '937': { lat: 36.7378, lng: -119.7871, city: 'Fresno, CA' },
  '940': { lat: 37.7749, lng: -122.4194, city: 'San Francisco, CA' },
  '941': { lat: 37.7749, lng: -122.4194, city: 'San Francisco, CA' },
  '942': { lat: 38.5816, lng: -121.4944, city: 'Sacramento, CA' },
  '943': { lat: 37.3382, lng: -121.8863, city: 'San Jose, CA' },
  '944': { lat: 37.3382, lng: -121.8863, city: 'San Jose, CA' },
  '945': { lat: 37.8044, lng: -122.2712, city: 'Oakland, CA' },
  '946': { lat: 37.8044, lng: -122.2712, city: 'Oakland, CA' },
  '947': { lat: 37.8716, lng: -122.2727, city: 'Berkeley, CA' },
  '948': { lat: 37.9577, lng: -122.3477, city: 'Richmond, CA' },
  '949': { lat: 37.5485, lng: -122.0590, city: 'Fremont, CA' },
  '950': { lat: 37.3382, lng: -121.8863, city: 'San Jose, CA' },
  '951': { lat: 37.3382, lng: -121.8863, city: 'San Jose, CA' },
  '952': { lat: 37.6879, lng: -122.4702, city: 'Daly City, CA' },
  '953': { lat: 37.4419, lng: -122.1430, city: 'Palo Alto, CA' },
  '954': { lat: 37.4852, lng: -122.2364, city: 'Redwood City, CA' },
  '955': { lat: 40.5865, lng: -122.3917, city: 'Redding, CA' },
  '956': { lat: 38.5816, lng: -121.4944, city: 'Sacramento, CA' },
  '957': { lat: 38.5816, lng: -121.4944, city: 'Sacramento, CA' },
  '958': { lat: 38.5816, lng: -121.4944, city: 'Sacramento, CA' },
  '959': { lat: 38.5816, lng: -121.4944, city: 'Sacramento, CA' },
  '970': { lat: 45.5152, lng: -122.6784, city: 'Portland, OR' },
  '971': { lat: 45.5152, lng: -122.6784, city: 'Portland, OR' },
  '972': { lat: 45.5152, lng: -122.6784, city: 'Portland, OR' },
  '973': { lat: 44.9429, lng: -123.0351, city: 'Salem, OR' },
  '974': { lat: 44.0521, lng: -123.0868, city: 'Eugene, OR' },
  '975': { lat: 42.3265, lng: -122.8756, city: 'Medford, OR' },
  '980': { lat: 47.6062, lng: -122.3321, city: 'Seattle, WA' },
  '981': { lat: 47.6062, lng: -122.3321, city: 'Seattle, WA' },
  '982': { lat: 47.2529, lng: -122.4443, city: 'Tacoma, WA' },
  '983': { lat: 47.2529, lng: -122.4443, city: 'Tacoma, WA' },
  '984': { lat: 47.2529, lng: -122.4443, city: 'Tacoma, WA' },
  '985': { lat: 47.0379, lng: -122.9007, city: 'Olympia, WA' },
  '986': { lat: 45.6387, lng: -122.6615, city: 'Vancouver, WA' },
  '990': { lat: 47.6588, lng: -117.4260, city: 'Spokane, WA' },
  '991': { lat: 47.6588, lng: -117.4260, city: 'Spokane, WA' },
  '992': { lat: 47.6588, lng: -117.4260, city: 'Spokane, WA' },
};

type LoadType = 'ftl' | 'ltl';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCurrencyDecimal = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Haversine formula for distance calculation
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;

  // Road routing factor varies by distance and terrain
  // Short distances (<100mi): roads are ~25-30% longer
  // Medium distances (100-500mi): ~20-25% longer
  // Long distances (>500mi): ~15-20% longer (interstate efficiency)
  let routingFactor: number;
  if (straightLine < 100) {
    routingFactor = 1.28; // Local roads, more winding
  } else if (straightLine < 300) {
    routingFactor = 1.24; // Mix of highways and local
  } else if (straightLine < 600) {
    routingFactor = 1.20; // Mostly interstate
  } else {
    routingFactor = 1.17; // Long haul interstate efficiency
  }

  return Math.round(straightLine * routingFactor);
};

// Get coordinates from ZIP code (approximate)
const getZipCoords = (zip: string): { lat: number; lng: number; city: string } | null => {
  const prefix = zip.substring(0, 3);
  return ZIP_REGIONS[prefix] || null;
};


export default function FreightCalculator({
  defaultOrigin = 'Atlanta, GA',
  defaultDestination = '',
  defaultDistance = 0,
  dryVanRatePerMile = 2.26,
  reeferPremiumPercent = 25,
  fuelSurchargePercent = 43.2,
  dieselPrice = 3.50,
}: FreightCalculatorProps) {
  // Input state
  const [originZip, setOriginZip] = useState('30301');
  const [destinationZip, setDestinationZip] = useState('');
  const [manualDistance, setManualDistance] = useState(defaultDistance.toString());
  const [loadType, setLoadType] = useState<LoadType>('ftl');
  const [ltlWeight, setLtlWeight] = useState(5000); // LTL weight in lbs

  // Derived origin/destination names
  const originInfo = useMemo(() => {
    const coords = getZipCoords(originZip);
    return coords ? coords.city : defaultOrigin;
  }, [originZip, defaultOrigin]);

  const destinationInfo = useMemo(() => {
    const coords = getZipCoords(destinationZip);
    return coords ? coords.city : defaultDestination || 'Enter destination';
  }, [destinationZip, defaultDestination]);

  // Calculate distance
  const calculatedDistance = useMemo(() => {
    // If manual distance is entered, use that
    if (manualDistance && parseInt(manualDistance) > 0) {
      return parseInt(manualDistance);
    }

    // Try to calculate from ZIP codes
    const originCoords = getZipCoords(originZip);
    const destCoords = getZipCoords(destinationZip);

    if (originCoords && destCoords) {
      return calculateDistance(
        originCoords.lat,
        originCoords.lng,
        destCoords.lat,
        destCoords.lng
      );
    }

    return 0;
  }, [originZip, destinationZip, manualDistance]);

  // Calculate freight rates
  const rates = useMemo(() => {
    if (calculatedDistance === 0) return null;

    const distance = calculatedDistance;

    // Base rates per mile
    const dryVanBase = dryVanRatePerMile;
    const reeferBase = dryVanRatePerMile * (1 + reeferPremiumPercent / 100);

    // FTL calculations
    const ftlDryVanLinehaul = distance * dryVanBase;
    const ftlReeferLinehaul = distance * reeferBase;

    // Fuel surcharge (applied to linehaul)
    const ftlDryVanFuel = ftlDryVanLinehaul * (fuelSurchargePercent / 100);
    const ftlReeferFuel = ftlReeferLinehaul * (fuelSurchargePercent / 100);

    // Totals
    const ftlDryVanTotal = ftlDryVanLinehaul + ftlDryVanFuel;
    const ftlReeferTotal = ftlReeferLinehaul + ftlReeferFuel;

    // LTL calculations (rate per CWT - hundred weight)
    // LTL typically costs more per mile but you share the truck
    const ltlRatePerCwt = 15 + (distance * 0.02); // Base + distance factor
    const ltlDryVanTotal = (ltlWeight / 100) * ltlRatePerCwt;
    const ltlReeferTotal = ltlDryVanTotal * (1 + reeferPremiumPercent / 100);

    // LTL fuel surcharge (typically lower percentage)
    const ltlFuelPercent = fuelSurchargePercent * 0.7; // LTL fuel is usually ~70% of FTL
    const ltlDryVanFuel = ltlDryVanTotal * (ltlFuelPercent / 100);
    const ltlReeferFuel = ltlReeferTotal * (ltlFuelPercent / 100);

    return {
      distance,
      ftl: {
        dryVan: {
          linehaul: ftlDryVanLinehaul,
          fuelSurcharge: ftlDryVanFuel,
          total: ftlDryVanTotal,
          ratePerMile: dryVanBase,
        },
        reefer: {
          linehaul: ftlReeferLinehaul,
          fuelSurcharge: ftlReeferFuel,
          total: ftlReeferTotal,
          ratePerMile: reeferBase,
        },
      },
      ltl: {
        weight: ltlWeight,
        dryVan: {
          baseRate: ltlDryVanTotal,
          fuelSurcharge: ltlDryVanFuel,
          total: ltlDryVanTotal + ltlDryVanFuel,
          ratePerCwt: ltlRatePerCwt,
        },
        reefer: {
          baseRate: ltlReeferTotal,
          fuelSurcharge: ltlReeferFuel,
          total: ltlReeferTotal + ltlReeferFuel,
          ratePerCwt: ltlRatePerCwt * (1 + reeferPremiumPercent / 100),
        },
      },
      fuelSurchargePercent,
      dieselPrice,
    };
  }, [calculatedDistance, dryVanRatePerMile, reeferPremiumPercent, fuelSurchargePercent, dieselPrice, ltlWeight]);

  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 to-slate-50" id="freight-calculator">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Ground Freight Calculator
          </h2>
          <p className="text-lg text-slate-600">
            Estimate trucking costs with dry van and refrigerated rates. Both FTL and LTL options.
          </p>
        </div>

        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Left Side - Inputs (2 cols) */}
              <div className="lg:col-span-2 p-6 space-y-5 bg-white">
                {/* Origin ZIP */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Origin ZIP Code
                  </Label>
                  <input
                    type="text"
                    value={originZip}
                    onChange={(e) => setOriginZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="30301"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <p className="text-xs text-slate-500">{originInfo}</p>
                </div>

                {/* Destination ZIP */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Destination ZIP Code
                  </Label>
                  <input
                    type="text"
                    value={destinationZip}
                    onChange={(e) => setDestinationZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="37201"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <p className="text-xs text-slate-500">{destinationInfo}</p>
                </div>

                {/* Manual Distance Override */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Distance (miles) <span className="text-slate-400 font-normal">- or enter manually</span>
                  </Label>
                  <input
                    type="number"
                    value={manualDistance}
                    onChange={(e) => setManualDistance(e.target.value)}
                    placeholder={calculatedDistance > 0 ? calculatedDistance.toString() : 'Auto-calculated'}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  {calculatedDistance > 0 && !manualDistance && (
                    <p className="text-xs text-green-600">
                      Estimated: {calculatedDistance.toLocaleString()} miles
                    </p>
                  )}
                </div>

                {/* Load Type Toggle */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Load Type</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLoadType('ftl')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        loadType === 'ftl'
                          ? 'bg-amber-100 border-amber-500 text-amber-800'
                          : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      FTL
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoadType('ltl')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        loadType === 'ltl'
                          ? 'bg-amber-100 border-amber-500 text-amber-800'
                          : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      LTL
                    </button>
                  </div>
                </div>

                {/* LTL Weight (only show for LTL) */}
                {loadType === 'ltl' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Shipment Weight (lbs)
                    </Label>
                    <input
                      type="range"
                      min={500}
                      max={20000}
                      step={500}
                      value={ltlWeight}
                      onChange={(e) => setLtlWeight(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>500 lbs</span>
                      <span className="font-semibold text-slate-900">
                        {ltlWeight.toLocaleString()} lbs
                      </span>
                      <span>20,000 lbs</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side - Results (3 cols) */}
              <div className="lg:col-span-3 p-6 bg-slate-50">
                {rates ? (
                  <div className="space-y-6">
                    {/* Distance Display */}
                    <div className="text-center pb-4 border-b border-slate-200">
                      <p className="text-sm text-slate-600 mb-1">
                        {originInfo} → {destinationInfo}
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {rates.distance.toLocaleString()} miles
                      </p>
                    </div>

                    {/* Rate Cards - Show both Dry Van and Reefer */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Dry Van Card */}
                      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Truck className="w-4 h-4 text-amber-700" />
                          </div>
                          <h3 className="font-semibold text-slate-900">Dry Van</h3>
                        </div>

                        {loadType === 'ftl' ? (
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Linehaul</span>
                              <span className="font-medium">{formatCurrency(rates.ftl.dryVan.linehaul)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">
                                Fuel surcharge ({rates.fuelSurchargePercent.toFixed(1)}%)
                              </span>
                              <span className="font-medium">{formatCurrency(rates.ftl.dryVan.fuelSurcharge)}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3 flex justify-between">
                              <span className="font-semibold text-slate-900">Total</span>
                              <span className="text-xl font-bold text-amber-600">
                                {formatCurrency(rates.ftl.dryVan.total)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                              {formatCurrencyDecimal(rates.ftl.dryVan.ratePerMile)}/mile
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">
                                Base ({rates.ltl.weight.toLocaleString()} lbs)
                              </span>
                              <span className="font-medium">{formatCurrency(rates.ltl.dryVan.baseRate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Fuel surcharge</span>
                              <span className="font-medium">{formatCurrency(rates.ltl.dryVan.fuelSurcharge)}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3 flex justify-between">
                              <span className="font-semibold text-slate-900">Total</span>
                              <span className="text-xl font-bold text-amber-600">
                                {formatCurrency(rates.ltl.dryVan.total)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                              {formatCurrencyDecimal(rates.ltl.dryVan.ratePerCwt)}/CWT
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Reefer Card */}
                      <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Snowflake className="w-4 h-4 text-blue-700" />
                          </div>
                          <h3 className="font-semibold text-slate-900">Refrigerated</h3>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            +{reeferPremiumPercent}%
                          </span>
                        </div>

                        {loadType === 'ftl' ? (
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Linehaul</span>
                              <span className="font-medium">{formatCurrency(rates.ftl.reefer.linehaul)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">
                                Fuel surcharge ({rates.fuelSurchargePercent.toFixed(1)}%)
                              </span>
                              <span className="font-medium">{formatCurrency(rates.ftl.reefer.fuelSurcharge)}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3 flex justify-between">
                              <span className="font-semibold text-slate-900">Total</span>
                              <span className="text-xl font-bold text-blue-600">
                                {formatCurrency(rates.ftl.reefer.total)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                              {formatCurrencyDecimal(rates.ftl.reefer.ratePerMile)}/mile
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">
                                Base ({rates.ltl.weight.toLocaleString()} lbs)
                              </span>
                              <span className="font-medium">{formatCurrency(rates.ltl.reefer.baseRate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Fuel surcharge</span>
                              <span className="font-medium">{formatCurrency(rates.ltl.reefer.fuelSurcharge)}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3 flex justify-between">
                              <span className="font-semibold text-slate-900">Total</span>
                              <span className="text-xl font-bold text-blue-600">
                                {formatCurrency(rates.ltl.reefer.total)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                              {formatCurrencyDecimal(rates.ltl.reefer.ratePerCwt)}/CWT
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fuel Surcharge Explanation */}
                    <div className="bg-slate-100 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-slate-600">
                          <p className="font-medium text-slate-700 mb-1">About Fuel Surcharge</p>
                          <p>
                            Current fuel surcharge of {rates.fuelSurchargePercent.toFixed(1)}% is based on
                            DOE diesel index at {formatCurrencyDecimal(rates.dieselPrice)}/gal.
                            Surcharges adjust weekly with fuel prices.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Get Quote CTA */}
                    <Button
                      type="button"
                      onClick={() => {
                        const element = document.getElementById('quote');
                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600"
                      size="lg"
                    >
                      Request Pricing
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>

                    <p className="text-xs text-slate-500 text-center">
                      Estimates based on industry averages. Distances are approximate road miles.
                      Actual rates vary based on capacity, seasonality, and lane-specific factors.
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                      <Truck className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm max-w-xs">
                      Enter origin and destination ZIP codes to calculate freight estimates for both
                      dry van and refrigerated shipments.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Source Attribution */}
        <p className="text-center text-xs text-slate-500 mt-4">
          Rates based on ATRI national averages. Fuel surcharge calculated from DOE/EIA diesel index.
        </p>
      </div>
    </section>
  );
}
