<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Service;
use App\Models\Repair;
use App\Models\Brand;
use App\Models\DeviceModel;
use App\Models\ModelService;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Default Test Customer
        $user = User::updateOrCreate(
            ['email' => 'rahul@cellcare.com'],
            [
                'first_name' => 'Rahul',
                'last_name'  => 'Sharma',
                'phone'      => '9876543210',
                'password'   => Hash::make('password123'),
                'role'       => 'customer',
            ]
        );

        // 2. Create Default Test Administrator
        $admin = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'first_name' => 'Super',
                'last_name'  => 'Admin',
                'phone'      => '9999988888',
                'password'   => Hash::make('123456'),
                'role'       => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@cellcare.com'],
            [
                'first_name' => 'Cell Care',
                'last_name'  => 'Admin',
                'phone'      => '9999977777',
                'password'   => Hash::make('123456'),
                'role'       => 'admin',
            ]
        );

        // 3. Seed Master Services
        $services = [
            ['name' => 'Screen Replacement', 'starting_price' => 999.00, 'icon' => 'smartphone'],
            ['name' => 'Battery Replacement', 'starting_price' => 799.00, 'icon' => 'battery'],
            ['name' => 'Charging Repair', 'starting_price' => 499.00, 'icon' => 'plug'],
            ['name' => 'Camera Repair', 'starting_price' => 899.00, 'icon' => 'camera'],
            ['name' => 'Speaker Repair', 'starting_price' => 599.00, 'icon' => 'speaker'],
            ['name' => 'Water Damage', 'starting_price' => 1299.00, 'icon' => 'droplets'],
        ];

        foreach ($services as $svc) {
            Service::updateOrCreate(['name' => $svc['name']], $svc);
        }

        // 4. Seed Hierarchical Brands -> Models -> Model Services
        $brandsData = [
            'Apple' => [
                'iPhone 16 Pro' => [
                    ['service_name' => 'Screen Replacement', 'category' => 'Screen', 'price' => 24999, 'warranty' => '6 Months', 'part_quality' => 'OEM Super Retina XDR'],
                    ['service_name' => 'Battery Replacement', 'category' => 'Battery', 'price' => 6999, 'warranty' => '6 Months', 'part_quality' => 'OEM Apple Battery'],
                    ['service_name' => 'Back Glass Laser Repair', 'category' => 'Hardware', 'price' => 7999, 'warranty' => '6 Months', 'part_quality' => 'Matte Textured Glass'],
                ],
                'iPhone 15' => [
                    ['service_name' => 'Screen Replacement', 'category' => 'Screen', 'price' => 16999, 'warranty' => '6 Months', 'part_quality' => 'OEM Super Retina'],
                    ['service_name' => 'Battery Replacement', 'category' => 'Battery', 'price' => 5499, 'warranty' => '6 Months', 'part_quality' => 'OEM Battery'],
                    ['service_name' => 'Charging Port Fix', 'category' => 'Hardware', 'price' => 2999, 'warranty' => '3 Months', 'part_quality' => 'USB-C Dock Flex'],
                ],
                'iPhone 14' => [
                    ['service_name' => 'Screen Replacement', 'category' => 'Screen', 'price' => 14499, 'warranty' => '6 Months', 'part_quality' => 'OEM Display'],
                    ['service_name' => 'Battery Replacement', 'category' => 'Battery', 'price' => 4999, 'warranty' => '6 Months', 'part_quality' => 'OEM Battery'],
                    ['service_name' => 'Back Glass Replacement', 'category' => 'Hardware', 'price' => 3999, 'warranty' => '6 Months', 'part_quality' => 'OEM Glass'],
                ],
                'iPhone 13' => [
                    ['service_name' => 'Screen Replacement', 'category' => 'Screen', 'price' => 12999, 'warranty' => '6 Months', 'part_quality' => 'OEM OLED Display'],
                    ['service_name' => 'Battery Replacement', 'category' => 'Battery', 'price' => 4499, 'warranty' => '6 Months', 'part_quality' => 'High-Capacity OEM'],
                    ['service_name' => 'Charging Port Repair', 'category' => 'Hardware', 'price' => 2499, 'warranty' => '3 Months', 'part_quality' => 'Lightning Flex Cable'],
                    ['service_name' => 'Camera Module Fix', 'category' => 'Hardware', 'price' => 3499, 'warranty' => '6 Months', 'part_quality' => 'Dual Camera Unit'],
                ],
            ],
            'Samsung' => [
                'Galaxy S24 Ultra' => [
                    ['service_name' => 'Dynamic AMOLED 2X Screen', 'category' => 'Screen', 'price' => 22999, 'warranty' => '6 Months', 'part_quality' => 'Original Samsung Service Pack'],
                    ['service_name' => 'Battery Replacement', 'category' => 'Battery', 'price' => 4999, 'warranty' => '6 Months', 'part_quality' => '5000mAh OEM Battery'],
                    ['service_name' => '200MP Main Camera Fix', 'category' => 'Hardware', 'price' => 7499, 'warranty' => '6 Months', 'part_quality' => 'OEM ISOCELL Sensor'],
                ],
                'Galaxy S23' => [
                    ['service_name' => 'Dynamic AMOLED Screen', 'category' => 'Screen', 'price' => 11499, 'warranty' => '6 Months', 'part_quality' => 'Original Display Panel'],
                    ['service_name' => 'Battery Replacement', 'category' => 'Battery', 'price' => 3499, 'warranty' => '6 Months', 'part_quality' => '3900mAh OEM Pack'],
                    ['service_name' => 'Charging Port Repair', 'category' => 'Hardware', 'price' => 1999, 'warranty' => '3 Months', 'part_quality' => 'Sub-Board PCB Dock'],
                ],
                'Galaxy Z Flip 5' => [
                    ['service_name' => 'Folding Inner Display', 'category' => 'Screen', 'price' => 18999, 'warranty' => '6 Months', 'part_quality' => 'Ultra Thin Glass OLED'],
                    ['service_name' => 'Cover Screen Fix', 'category' => 'Screen', 'price' => 6499, 'warranty' => '6 Months', 'part_quality' => 'Flex Window OLED'],
                ],
            ],
            'OnePlus' => [
                'OnePlus 12' => [
                    ['service_name' => '2K ProXDR Curved Display', 'category' => 'Screen', 'price' => 13999, 'warranty' => '6 Months', 'part_quality' => 'BOE X1 Luminescent Panel'],
                    ['service_name' => '5400mAh Dual-Cell Battery', 'category' => 'Battery', 'price' => 3499, 'warranty' => '6 Months', 'part_quality' => '100W SuperVOOC Pack'],
                ],
                'OnePlus 11' => [
                    ['service_name' => 'Fluid AMOLED Display', 'category' => 'Screen', 'price' => 10499, 'warranty' => '6 Months', 'part_quality' => '120Hz LTPO 3.0'],
                    ['service_name' => 'Battery Replacement', 'category' => 'Battery', 'price' => 2999, 'warranty' => '6 Months', 'part_quality' => '5000mAh Dual-Cell'],
                ],
            ],
            'Google' => [
                'Pixel 9' => [
                    ['service_name' => 'Actua OLED Display', 'category' => 'Screen', 'price' => 15999, 'warranty' => '6 Months', 'part_quality' => 'Original Google Panel'],
                    ['service_name' => 'Battery Replacement', 'category' => 'Battery', 'price' => 4499, 'warranty' => '6 Months', 'part_quality' => 'OEM Battery Pack'],
                ],
                'Pixel 8 Pro' => [
                    ['service_name' => 'Super Actua LTPO Display', 'category' => 'Screen', 'price' => 16499, 'warranty' => '6 Months', 'part_quality' => 'Original 120Hz Panel'],
                    ['service_name' => 'Camera Sensor Fix', 'category' => 'Hardware', 'price' => 4999, 'warranty' => '6 Months', 'part_quality' => '50MP Octa PD Unit'],
                ],
            ],
        ];

        foreach ($brandsData as $brandName => $models) {
            $brand = Brand::updateOrCreate(['name' => $brandName], ['name' => $brandName]);

            foreach ($models as $modelName => $servicesList) {
                $deviceModel = DeviceModel::updateOrCreate(
                    ['brand_id' => $brand->id, 'name' => $modelName],
                    ['brand_id' => $brand->id, 'name' => $modelName]
                );

                foreach ($servicesList as $srv) {
                    ModelService::updateOrCreate(
                        [
                            'device_model_id' => $deviceModel->id,
                            'service_name'    => $srv['service_name'],
                        ],
                        [
                            'device_model_id' => $deviceModel->id,
                            'service_name'    => $srv['service_name'],
                            'category'        => $srv['category'],
                            'price'           => $srv['price'],
                            'warranty'        => $srv['warranty'],
                            'part_quality'    => $srv['part_quality'],
                        ]
                    );
                }
            }
        }

        // 5. Seed Initial Repair
        Repair::updateOrCreate(
            ['id' => 'REP-2026-9823A'],
            [
                'user_id'          => $user->id,
                'device'           => 'iPhone 13 Pro',
                'service'          => 'Screen Replacement',
                'problem'          => 'Cracked glass and touch unresponsive on bottom half',
                'status'           => 'Repairing',
                'estimate'         => 4500.00,
                'appointment_date' => now()->addDays(1),
                'method'           => 'Pickup & Delivery',
                'payment_status'   => 'Pending',
            ]
        );
    }
}
