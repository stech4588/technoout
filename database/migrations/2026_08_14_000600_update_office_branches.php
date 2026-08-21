<?php

use App\Services\BusinessSettings;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $now = now();
        $existing = DB::table('office_locations')->orderBy('id')->get();
        $lahoreId = $existing->first()?->id;
        $sheikhupuraId = $existing->skip(1)->first()?->id;

        if ($lahoreId) {
            DB::table('office_locations')->where('id', $lahoreId)->update([
                'name' => 'Lahore Office', 'address_line_1' => 'Office No. 5, First Floor, Mozang Hights, 43 Mozang Rd',
                'address_line_2' => 'Mozang Chungi', 'city' => 'Lahore', 'region' => 'Punjab',
                'postal_code' => '54000', 'country' => 'Pakistan', 'is_primary' => true,
                'is_active' => true, 'sort_order' => 1, 'updated_at' => $now,
            ]);
        } else {
            $lahoreId = DB::table('office_locations')->insertGetId([
                'name' => 'Lahore Office', 'address_line_1' => 'Office No. 5, First Floor, Mozang Hights, 43 Mozang Rd',
                'address_line_2' => 'Mozang Chungi', 'city' => 'Lahore', 'region' => 'Punjab', 'postal_code' => '54000',
                'country' => 'Pakistan', 'is_primary' => true, 'is_active' => true, 'sort_order' => 1,
                'created_at' => $now, 'updated_at' => $now,
            ]);
        }

        if ($sheikhupuraId) {
            DB::table('office_locations')->where('id', $sheikhupuraId)->update([
                'name' => 'Sheikhupura Office', 'address_line_1' => 'Office # 19, New Quaid-e-Azam Block, Kiyani Road',
                'address_line_2' => null, 'city' => 'Sheikhupura', 'region' => 'Punjab', 'postal_code' => null,
                'country' => 'Pakistan', 'is_primary' => false, 'is_active' => true, 'sort_order' => 2, 'updated_at' => $now,
            ]);
        } else {
            $sheikhupuraId = DB::table('office_locations')->insertGetId([
                'name' => 'Sheikhupura Office', 'address_line_1' => 'Office # 19, New Quaid-e-Azam Block, Kiyani Road',
                'city' => 'Sheikhupura', 'region' => 'Punjab', 'country' => 'Pakistan', 'is_primary' => false,
                'is_active' => true, 'sort_order' => 2, 'created_at' => $now, 'updated_at' => $now,
            ]);
        }

        $productionId = DB::table('office_locations')->where('name', 'Production Unit')->value('id');
        $production = [
            'address_line_1' => 'Viatech, New Jamia Masjid Makki Ahle Hadith, Ghordor Road', 'address_line_2' => null,
            'city' => 'Gujranwala', 'region' => 'Punjab', 'postal_code' => null, 'country' => 'Pakistan',
            'is_primary' => false, 'is_active' => true, 'sort_order' => 3, 'updated_at' => $now,
        ];
        if ($productionId) DB::table('office_locations')->where('id', $productionId)->update($production);
        else $productionId = DB::table('office_locations')->insertGetId(['name' => 'Production Unit', ...$production, 'created_at' => $now]);

        DB::table('contact_channels')->whereIn('office_location_id', [$lahoreId, $sheikhupuraId, $productionId])->delete();
        DB::table('contact_channels')->insert([
            ['office_location_id'=>$lahoreId,'type'=>'phone','label'=>'Contact number','value'=>'042-36303112','is_primary'=>true,'is_public'=>true,'sort_order'=>1,'created_at'=>$now,'updated_at'=>$now],
            ['office_location_id'=>$sheikhupuraId,'type'=>'phone','label'=>'Contact number','value'=>'042-36303112','is_primary'=>false,'is_public'=>true,'sort_order'=>1,'created_at'=>$now,'updated_at'=>$now],
            ['office_location_id'=>$productionId,'type'=>'mobile','label'=>'Contact number','value'=>'0316-4525002','is_primary'=>false,'is_public'=>true,'sort_order'=>1,'created_at'=>$now,'updated_at'=>$now],
        ]);

        BusinessSettings::forget();
    }

    public function down(): void
    {
        // Branch contact data is intentionally retained to avoid destructive rollback of business details.
    }
};
