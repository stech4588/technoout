<?php
namespace Database\Seeders;
use App\Models\{BusinessProfile,Category,ContactChannel,ContentPage,OfficeLocation,Product,User};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\{Permission,Role};
class DatabaseSeeder extends Seeder {
    public function run(): void {
        if (app()->environment('production') && (!env('ADMIN_PASSWORD') || env('ADMIN_PASSWORD') === 'ChangeMe123!')) {
            throw new \RuntimeException('Set a strong, unique ADMIN_PASSWORD before production seeding.');
        }
        $profile=BusinessProfile::create(['name'=>'ViaTech','legal_name'=>'ViaTech Technical Consultants','tagline'=>'Measure. Control. Solve.','description'=>'Future-ready automation, access control, physical security and industrial entry solutions for Pakistan.','currency'=>'PKR','quote_prefix'=>'QTN','invoice_prefix'=>'INV','footer_text'=>'Automation, security and industrial access systems—measured, controlled and solved with care.']);
        $lahore=OfficeLocation::create(['name'=>'Lahore Office','address_line_1'=>'Office No. 5, First Floor, Mozang Hights, 43 Mozang Rd','address_line_2'=>'Mozang Chungi','city'=>'Lahore','region'=>'Punjab','postal_code'=>'54000','is_primary'=>true,'sort_order'=>1]);
        $sheikhupura=OfficeLocation::create(['name'=>'Sheikhupura Office','address_line_1'=>'Office # 19, New Quaid-e-Azam Block, Kiyani Road','city'=>'Sheikhupura','region'=>'Punjab','sort_order'=>2]);
        $production=OfficeLocation::create(['name'=>'Production Unit','address_line_1'=>'Viatech, New Jamia Masjid Makki Ahle Hadith, Ghordor Road','city'=>'Gujranwala','region'=>'Punjab','sort_order'=>3]);
        foreach([[$lahore,'phone','Contact number','042-36303112'],[$sheikhupura,'phone','Contact number','042-36303112'],[$production,'mobile','Contact number','0316-4525002'],[null,'email','General enquiries','info@technoout.pk']] as $c) ContactChannel::create(['office_location_id'=>$c[0]?->id,'type'=>$c[1],'label'=>$c[2],'value'=>$c[3],'is_primary'=>$c[1]==='email']);
        foreach(['facebook'=>'https://facebook.com/technooutpk','linkedin'=>'https://linkedin.com/company/technoout','youtube'=>'https://youtube.com/@technoout'] as $p=>$u) DB::table('social_links')->insert(['platform'=>$p,'url'=>$u,'created_at'=>now(),'updated_at'=>now()]);
        $cats=['Automatic Entry Systems','Access Control Systems','Physical Security Equipment','Industrial Doors','Loading Bay Equipment','Safety & Protection','Industrial IT & Communication Systems','Accessories','Fabrication'];
        $map=[];foreach($cats as $i=>$name)$map[$name]=Category::updateOrCreate(['slug'=>Str::slug($name)],['name'=>$name,'description'=>'Professional '.$name.' engineered, installed and supported across Pakistan.','sort_order'=>$i+1]);
        // Catalog products come from the scraper in real environments. These
        // small records exist only so isolated unit tests have product fixtures.
        if (app()->runningUnitTests()) {
        $products=[
            ['Automatic Doors','Automatic Entry Systems','Elegant sliding, swing and hospital-door automation for modern pedestrian entrances.'],
            ['Automatic Gates','Automatic Entry Systems','Sliding and swing gate operators for demanding residential, commercial and industrial sites.'],
            ['Automatic Shutters','Automatic Entry Systems','Reliable motorized roller shutters for shops, garages and controlled openings.'],
            ['Attendance & Access Devices','Access Control Systems','Biometric and card-based personnel access and attendance terminals.'],
            ['Automatic Road Barriers','Access Control Systems','High-cycle boom barriers for parking, toll, residential and controlled sites.'],
            ['Electric Locks','Access Control Systems','Fail-safe and fail-secure locking hardware for controlled doors.'],
            ['RFID Vehicle Access Control','Access Control Systems','Long-range RFID and e-tag vehicle identification for hands-free access.'],
            ['Turnstile Gates','Access Control Systems','Tripod, flap and full-height turnstiles for managed pedestrian flow.'],
            ['Hydraulic Road Blocker','Physical Security Equipment','High-security electro-hydraulic rising road blocker for protected entrances.'],
            ['Road Spikes & Tire Killers','Physical Security Equipment','Directional and controlled tire-killer systems for vehicle security.'],
            ['Walkthrough Metal Detector','Physical Security Equipment','Multi-zone screening gates for secure public and private facilities.'],
            ['Under Vehicle Surveillance System','Physical Security Equipment','High-resolution vehicle undercarriage inspection and recording.'],
            ['High Speed PVC Roll-Up Doors','Industrial Doors','Fast-cycle flexible doors that improve hygiene, traffic flow and energy control.'],
            ['Industrial Sectional Doors','Industrial Doors','Insulated sectional doors with safety protection for industrial openings.'],
            ['Hydraulic Dock Leveler','Loading Bay Equipment','Robust hydraulic dock levellers for safe, efficient loading operations.'],
            ['Panic & Emergency Exit Doors','Safety & Protection','Purpose-built emergency egress doors with panic hardware.'],
            ['Fire Rated Doors','Safety & Protection','Tested fire-resistant steel doors for protected compartments and escape routes.'],
            ['Movement & Safety Sensors','Accessories','Activation and presence sensors for safe automated entrance operation.'],
        ];
        foreach($products as $i=>$p)Product::updateOrCreate(['slug'=>Str::slug($p[0])],['name'=>$p[0],'sku'=>'VT-'.str_pad((string)($i+1),3,'0',STR_PAD_LEFT),'category_id'=>$map[$p[1]]->id,'summary'=>$p[2],'description'=>$p[2].' ViaTech provides survey, specification, installation, commissioning and after-sales support.','specifications'=>['Service'=>'Supply, installation and support','Coverage'=>'Pakistan','Warranty'=>'Project specific'],'price_mode'=>'quote','is_featured'=>$i<6,'is_published'=>true]);
        }
        $pages=[
            ['page','About ViaTech','about-us','A company constantly moving forward','ViaTech delivers modern automatic entry, physical security, access control and industrial systems. Innovation, reliability and complete after-sales support guide every project.'],
            ['page','Company History','company-history','Built around engineering progress','From our beginnings in specialist automation, we have expanded into integrated entrance, industrial and high-security infrastructure solutions.'],
            ['page','Core Values','core-values','Precision. Integrity. Service.','We specify responsibly, install carefully, communicate clearly and remain available throughout the service life of every solution.'],
            ['page','Our Team','our-team','Specialists working as one','Our sales, engineering, fabrication, installation and service teams collaborate to deliver accountable project outcomes.'],
            ['page','Brand Partners','brand-partners','Technology selected for performance','We work with established international manufacturers and choose components according to duty cycle, environment and lifecycle requirements.'],
            ['page','Certifications','certifications','Quality built into the process','Our management and delivery processes are aligned with recognized quality, safety and information-security practices.'],
            ['page','Careers','careers','Build the future with us','We welcome engineers, technicians, project professionals and customer-focused specialists who want to shape safer, smarter spaces.'],
            ['news','Latest News','latest-news','Insights from the field','Project updates, product developments and practical guidance from the ViaTech team.'],
            ['solution','Solutions','solutions','Connected systems, complete outcomes','Explore integrated solutions for people, vehicles, facilities, loading bays and secure perimeters.'],
            ['solution','Loading Bay Solution','loading-bay-solution','Safer movement at the dock','Integrated dock levellers, shelters, doors, controls and safety accessories.'],
            ['solution','Parking Management & Guidance','parking-management-guidance-solution','Frictionless vehicle flow','Barrier, ticketing, RFID, occupancy and guidance systems for managed parking.'],
            ['solution','Perimeter Security Solutions','perimeter-security-solutions','Layered protection at the boundary','Road blockers, tire killers, barriers, surveillance and access control designed as one system.'],
            ['solution','Personnel Access Control','personnel-access-control-solution','The right access, at the right time','Credentials, biometrics, controllers, locks, turnstiles and reporting for controlled facilities.'],
            ['solution','RFID E-Tag Vehicle Access','rfid-etag-vehicle-access-control-solution','Identify vehicles without delay','Long-range identification and automated access for staff, residents and fleets.'],
            ['solution','Road Safety Solutions','road-safety-solutions','Designing safer traffic movement','Speed control, channelization, signaling and protective road equipment.'],
            ['solution','Visitor Management','visitor-management-solution','A better front-door experience','Pre-registration, identity verification, passes and access workflows for visitors.'],
            ['project','Our Projects','our-projects','Engineered for real environments','A portfolio spanning corporate, industrial, hospitality, healthcare, logistics and high-security facilities.'],
            ['page','Support','support','Support across the system lifecycle','From technical consultation to preventive maintenance and responsive field support.'],
            ['page','Technical Support','technical-support','Expert help when it matters','Troubleshooting, repair, spare parts, upgrades and service agreements for supported systems.'],
            ['page','Warranty','warranty','Clear coverage, dependable service','Warranty terms are documented for each project and supported by our service team.'],
            ['page','Product Demonstration','product-demonstration','See the technology in action','Request an on-site or remote demonstration tailored to your application.'],
        ];foreach($pages as $i=>$p)ContentPage::create(['type'=>$p[0],'title'=>$p[1],'slug'=>$p[2],'eyebrow'=>$p[3],'excerpt'=>$p[4],'body'=>$p[4],'sort_order'=>$i+1]);
        $permissions=['dashboard.view','inquiries.manage','quotations.manage','invoices.manage','payments.manage','emails.manage','products.manage','content.manage','business.manage','users.manage','roles.manage','audit.view'];
        foreach($permissions as $p)Permission::findOrCreate($p);
        $roles=['Super Admin'=>$permissions,'Sales'=>['dashboard.view','inquiries.manage','quotations.manage','emails.manage'],'Accounts'=>['dashboard.view','quotations.manage','invoices.manage','payments.manage','emails.manage'],'Catalog Manager'=>['dashboard.view','products.manage'],'Content Editor'=>['dashboard.view','content.manage'],'Support'=>['dashboard.view','inquiries.manage','emails.manage']];
        foreach($roles as $name=>$perms){$role=Role::findOrCreate($name);$role->syncPermissions($perms);}
        $admin=User::create(['name'=>'ViaTech Administrator','email'=>env('ADMIN_EMAIL','admin@technoout.pk'),'password'=>Hash::make(env('ADMIN_PASSWORD','ChangeMe123!')),'email_verified_at'=>now(),'is_active'=>true]);$admin->assignRole('Super Admin');
    }
}
