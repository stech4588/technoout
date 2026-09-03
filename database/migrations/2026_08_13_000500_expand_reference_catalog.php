<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        $parents = [
            'automatic-entry-systems'=>'Automatic Entry Systems','access-control-systems'=>'Access Control Systems',
            'physical-security-equipment'=>'Physical Security Equipment','industrial-doors'=>'Industrial Doors',
            'loading-bay-equipment'=>'Loading Bay Equipment','safety-protection'=>'Safety & Protection',
            'accessories'=>'Accessories','fabrication'=>'Fabrication',
        ];
        $ids=[];
        foreach($parents as $slug=>$name){$id=DB::table('categories')->where('slug',$slug)->value('id');if(!$id)$id=DB::table('categories')->insertGetId(['name'=>$name,'slug'=>$slug,'description'=>'Professional '.$name.' for commercial, residential and industrial applications.','is_active'=>true,'sort_order'=>count($ids)+1,'created_at'=>now(),'updated_at'=>now()]);$ids[$slug]=$id;}
        $children = [
            'automatic-doors'=>['Automatic Doors','automatic-entry-systems'],'automatic-gates'=>['Automatic Gates','automatic-entry-systems'],'automatic-shutters'=>['Automatic Shutters','automatic-entry-systems'],
            'attendance-access-devices'=>['Attendance and Access Devices','access-control-systems'],'automatic-road-barriers'=>['Automatic Road Barriers','access-control-systems'],'e-tag-vehicle-access-control'=>['E-tag Vehicle Access Control','access-control-systems'],'electric-locks'=>['Electric Locks','access-control-systems'],'rfid-cards-and-tags'=>['RFID Cards and Tags','access-control-systems'],'rfid-readers'=>['RFID Readers','access-control-systems'],'turnstile-gates'=>['Turnstile Gates','access-control-systems'],
            'automatic-road-blocker'=>['Automatic Road Blockers','physical-security-equipment'],'concrete-plastic-road-blockers'=>['Concrete and Plastic Road Blockers','physical-security-equipment'],'manual-delta-barriers'=>['Manual Delta Barriers','physical-security-equipment'],'tire-killer-road-spikes'=>['Tire Killers and Road Spikes','physical-security-equipment'],'under-vehicle-surveillance-systems'=>['Under Vehicle Surveillance Systems','physical-security-equipment'],'walkthrough-gates-metal-detectors'=>['Walkthrough Gates and Metal Detectors','physical-security-equipment'],
            'movement-sensors'=>['Movement Sensors','accessories'],'push-buttons'=>['Push Buttons','accessories'],'safety-sensors'=>['Safety Sensors','accessories'],'signal-lights'=>['Signal Lights','accessories'],'spare-parts'=>['Spare Parts','accessories'],'vehicle-detectors'=>['Vehicle Detectors','accessories'],
        ];
        foreach($children as $slug=>[$name,$parent]){$id=DB::table('categories')->where('slug',$slug)->value('id');if(!$id)$id=DB::table('categories')->insertGetId(['parent_id'=>$ids[$parent],'name'=>$name,'slug'=>$slug,'description'=>$name.' selected for reliable system integration and supported installation.','is_active'=>true,'sort_order'=>count($ids)+1,'created_at'=>now(),'updated_at'=>now()]);$ids[$slug]=$id;}

        // Production/local catalog records are populated by the scraper. Keep
        // this legacy reference dataset available only as isolated test data.
        if (app()->runningUnitTests()) {
        $rows = <<<'CATALOG'
evacs-u79-series-uhf-rfid-high-performance-integrated-reader|eVACS U79 Series UHF RFID High Performance Integrated Reader|rfid-readers
rgl100-led-traffic-signal-light|RGL100-L LED Traffic Signal Light|signal-lights
evacs-u63t-uhf-rfid-high-performance-integrated-reader|eVACS U63T UHF RFID High Performance Integrated Reader|rfid-readers
ibox-103-plus-fanless-industrial-pc-in-pakistan|iBOX 103 Plus Fanless Industrial PC|e-tag-vehicle-access-control
ibox-605-fanless-industrial-pc-in-pakistan|iBOX 605 Fanless Industrial PC|e-tag-vehicle-access-control
move-ds3-automatic-road-barrier|MOVE DS3 Automatic Road Barrier|e-tag-vehicle-access-control
move-ds6a-automatic-road-barrier|MOVE DS6A Automatic Road Barrier|e-tag-vehicle-access-control
move-dsw100-automatic-swing-door-system|MOVE DSW100 Automatic Swing Door System|automatic-doors
roller-shutter-chain-motor-600-kg|Roller Shutter Chain Motor 600Kg|automatic-shutters
move-smd-150-automatic-sliding-door-system|MOVE SMD150 Automatic Sliding Door System|automatic-doors
sanity-walk-through-sanitizer-disinfector-in-pakistan|Walkthrough Sanitizer System|safety-protection
access-control-panel-c3-series|C3 Series Access Control Panel|attendance-access-devices
powertech-ph2-infrared-sensor|POWERTECH PH2 Infrared Sensor|safety-sensors
evacs-u83-uhf-rfid-high-performance-integrated-reader|eVACS U83 UHF RFID High Performance Integrated Reader|rfid-readers
evacs-u89-uhf-rfid-high-performance-integrated-reader|eVACS U89 UHF RFID High Performance Integrated Reader|rfid-readers
cuppon-srdr2-radar-movement-sensor|CUPPON SRDR-2 Radar Movement Sensor|movement-sensors
cuppon-csd200-automatic-sliding-door-system-in-pakistan|Cuppon CSD200 Automatic Sliding Door System|automatic-doors
cuppon-csd150-automatic-sliding-door-system-in-pakistan|Cuppon CSD150 Automatic Sliding Door System|automatic-doors
hydraulic-dock-leveler-manufacturer-in-pakistan|Dock Leveler|loading-bay-equipment
evacs-u63-uhf-rfid-high-performance-integrated-reader|eVACS U63 UHF RFID High Performance Integrated Reader|rfid-readers
move-ds2-automatic-road-barrier|MOVE DS2 Automatic Road Barrier|automatic-road-barriers
move-msl1500-automation-for-sliding-gates-in-pakistan|MOVE MSL1500 Automation for Sliding Gates|automatic-gates
move-msl300-automation-for-sliding-gates|MOVE MSL300 Automation for Sliding Gates|automatic-gates
powertech-pl800h-sliding-gate-operator|Powertech PL800H Sliding Gate Operator|automatic-gates
powertech-pl500h-sliding-gate-operator|Powertech PL500H Sliding Gate Operator|automatic-gates
ditec-das-107-automatic-sliding-door-operator|Ditec DAS107 Automation for Sliding Doors|automatic-doors
fire-rated-door-in-pakistan|Fire Rated Doors|fabrication
industrial-gates-doors-fabrication|Industrial Gates and Doors|fabrication
panic-escape-and-emergency-exit-doors|Panic Escape and Emergency Exit Doors|fabrication
electromagnetic-door-lock|Electromagnetic Door Lock 600lbs|electric-locks
door-access-control-fail-safe-dead-bolt-electric-lock|Fail Safe Electric Dead Bolt Lock|electric-locks
galvanized-steel-gear-rack|Galvanized Steel Gear Rack|spare-parts
access-control-door-release-metal-push-button|Metal Push Button for Access Control Door|push-buttons
access-control-door-release-plastic-push-button|Plastic Push Button for Access Control Door|push-buttons
wejoin-wjts122-tripod-turnstile-in-pakistan|WEJOIN WJTS122 Tripod Turnstile|turnstile-gates
wejoin-wjts112-tripod-turnstile-in-pakistan|WEJOIN WJTS112 Tripod Turnstile|turnstile-gates
wejoin-wjdz801-automatic-road-barrier-in-pakistan|WEJOIN WJDZ801 Automatic Road Barrier|automatic-road-barriers
wejoin-wjdz102-automatic-road-barrier-in-pakistan|WEJOIN WJDZ102 Automatic Road Barrier|automatic-road-barriers
zkteco-pb1000-parking-barrier|ZKTeco PB1000 Series Parking Barrier|automatic-road-barriers
defend-uv4c-under-vehicle-surveillance|DEFEND UV4C Under Vehicle Surveillance|under-vehicle-surveillance-systems
rgl200-ax-arrow-cfross-led-traffic-signal-light|RGL200-AX Arrow Cross LED Traffic Signal Light|signal-lights
rgl200-led-traffic-signal-light|RGL200 LED Traffic Signal Light|signal-lights
move-ph1-infrared-sensor|MOVE PH1 Infrared Sensor|safety-sensors
pd132-single-channel-vehicle-detector|PD132 Enhanced Single Channel Vehicle Detector|vehicle-detectors
move-vxd1-single-channel-vehicle-loop-detector|MOVE VXD1 Single Channel Vehicle Loop Detector|vehicle-detectors
cuppon-srdr-radar-movement-sensor|CUPPON SRDR Radar Movement Sensor|movement-sensors
optex-oa-203c-active-infrared-presence-door-sensor|OPTEX OA-203C Active Infrared Presence Door Sensor|movement-sensors
bea-eagle-six-microwave-motion-sensor|Eagle-Six Microwave Motion Sensor|movement-sensors
zkteco-uface800-time-attendance-and-access-control-terminal|ZKTeco uFace800 Time Attendance and Access Control Terminal|attendance-access-devices
zkteco-x628-c-time-attendance-terminal|ZKTeco X628-C Time Attendance Terminal|attendance-access-devices
zkteco-f18-attendance-and-access-terminal|ZKTeco F18 Attendance and Access Terminal|attendance-access-devices
125-khz-rfid-card|RFID Card 125 KHz|rfid-cards-and-tags
alien-h3-iso18000-6cepc-gen2-uhf-rfid-card|ALIEN H3 ISO18000-6C EPC Gen2 UHF RFID Card|rfid-cards-and-tags
alien-h3-iso18000-6c-epc-gen2-uhf-windshield-tag|ALIEN H3 ISO18000-6C EPC Gen2 UHF Windshield Tag|rfid-cards-and-tags
chafon-cf-ru5112-uhf-rfid-high-performance-integrated-reader|CHAFON CF-RU5112 UHF RFID Integrated Reader|rfid-readers
chafon-cf-ru5109-uhf-rfid-high-performance-integrated-reader|CHAFON CF-RU5109 UHF RFID Integrated Reader|rfid-readers
chafon-cf-ru5102-uhf-desktop-usb-reader-writer|CHAFON CF-RU5102 UHF Desktop USB Reader and Writer|rfid-readers
automatic-roller-shutter|Automatic Roller Shutter|automatic-shutters
industrial-sectional-door|Industrial Sectional Doors|industrial-doors
high-speed-pvc-stacking-door|High Speed PVC Stacking Door|industrial-doors
high-speed-pvc-roll-up-doors|High Speed PVC Roll Up Doors|industrial-doors
tau-master18qr-sliding-gate-operator|TAU MASTER18QR Sliding Gate Operator|automatic-gates
tau-t-one-8br-sliding-gate-operator|TAU T-ONE-8BR Sliding Gate Operator|automatic-gates
powertech-psa1000-sliding-gate-operator|POWERTECH PSA1000 Sliding Gate Operator|automatic-gates
powertech-psa700-sliding-gate-operator|POWERTECH PSA700 Sliding Gate Operator|automatic-gates
defend-uv3c-under-vehicle-surveillance|DEFEND UV3C Under Vehicle Surveillance|under-vehicle-surveillance-systems
jersey-barriers|Jersey Barriers|concrete-plastic-road-blockers
walk-through-gates-metal-detectors|Walk Through Gates and Metal Detectors|walkthrough-gates-metal-detectors
defend-mdb-x-manual-barriers|DEFEND MDB-X Manual Barriers|manual-delta-barriers
defend-mtk-x-motorized-tyre-killers|DEFEND MTK-X Motorized Tyre Killers|tire-killer-road-spikes
defend-otk-x-one-way-tyre-killers|DEFEND OTK-X One Way Tyre Killers|tire-killer-road-spikes
defend-hrb-x-hydraulic-road-blocker|DEFEND HRB-X Hydraulic Road Blocker|automatic-road-blocker
dooya-roller-shutter-chain-motor|DOOYA Roller Shutter Chain Motor|automatic-shutters
label-evolus-sliding-door-operator|LABEL Evolus Sliding Door Operator|automatic-doors
dortex-ez-100-sliding-door-operator|Dortex EZ-100 Sliding Door Operator|automatic-doors
powertech-pl500-sliding-gate-operator|Powertech PL500 WiFi Sliding Gate Operator|automatic-gates
powertech-pw330-swing-gate-operator|Powertech PW330 Swing Gate Operator|automatic-gates
CATALOG;
        $categoryNames=DB::table('categories')->pluck('name','id');
        foreach(preg_split('/\R/',trim($rows)) as $index=>$line){[$slug,$name,$categorySlug]=explode('|',$line);if(DB::table('products')->where('slug',$slug)->exists())continue;$categoryId=$ids[$categorySlug]??$ids['accessories'];$categoryName=$categoryNames[$categoryId]??'technology systems';$brand=strtok($name,' ');DB::table('products')->insert(['category_id'=>$categoryId,'name'=>$name,'slug'=>$slug,'sku'=>'REF-'.str_pad((string)($index+1),3,'0',STR_PAD_LEFT),'brand'=>Str::upper($brand),'summary'=>$name.' for integrated '.$categoryName.' applications.','description'=>$name.' is available for project-specific selection and integration. ViaTech can assist with application review, compatible accessories, installation planning, commissioning and after-sales support.','specifications'=>json_encode(['Product family'=>$categoryName,'Availability'=>'Contact for current model and lead time','Support'=>'Application, installation and after-sales support']),'price_mode'=>'quote','is_featured'=>$index<6,'is_published'=>true,'seo_title'=>$name.' in Pakistan','seo_description'=>'Request specifications and project support for '.$name.'.','created_at'=>now(),'updated_at'=>now()]);}
        }
    }

    public function down(): void
    {
        DB::table('products')->where('sku','like','REF-%')->delete();
    }
};
