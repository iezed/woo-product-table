<?php
namespace WOO_PRODUCT_TABLE\Admin;

use WOO_PRODUCT_TABLE\Core\Base;

class Page_Loader extends Base
{
    public $main_slug = 'edit.php?post_type=wpt_product_table';
    public $page_folder_dir;
    public $topbar_file;
    public $topbar_sub_title;

    public $is_pro; //I tried to load inside hook, then make it public
    protected $pro_version;
    protected $license;

    public function __construct()
    {
        $this->is_pro = defined( 'WPT_PRO_DEV_VERSION' );
        if($this->is_pro && class_exists( 'WOO_Product_Table' ) ){
            $this->pro_version = WPT_PRO_DEV_VERSION;
            $this->license = \WOO_Product_Table::$direct;
        }
        $this->page_folder_dir = $this->base_dir . 'admin/page/';
        $this->topbar_file = $this->page_folder_dir . 'topbar.php';
        $this->topbar_sub_title = __("Manage and Settings", "wcmmq");
    }

    public function run()
    {
        
        //has come from admin/menu_plugin_settings_link.php file
        add_action( 'admin_menu', [$this, 'admin_menu'] );
        add_action( 'admin_enqueue_scripts', [$this, 'admin_enqueue_scripts'] );
        
    }

    public function configure_page_render()
    {
        include $this->topbar_file;
        include $this->page_folder_dir . 'configure.php';
    }
    public function admin_menu()
    {
        add_submenu_page( $this->main_slug, esc_html__( 'Configuration', 'woo-product-table' ),  esc_html__( 'Configure', 'woo-product-table' ), WPT_CAPABILITY, 'woo-product-table-config', [$this, 'configure_page_render'] );
        add_submenu_page( $this->main_slug, esc_html__( 'Live Support', 'woo-product-table' ),  __( 'Live Support', 'woo-product-table' ), WPT_CAPABILITY, 'wpt-live-support', 'wpt_live_support' );

        if( ! $this->is_pro ){
            add_submenu_page( $this->main_slug, esc_html__( 'Try Pro Version', 'woo-product-table' ),  esc_html__( 'Try Pro Version', 'woo-product-table' ), WPT_CAPABILITY, 'https://try.wooproducttable.com/wp-admin/?utm=PluginDashboard' );
            add_submenu_page( $this->main_slug, esc_html__( 'GET PRO VERSION', 'woo-product-table' ),  __( '<i>Get <strong>Pro</strong></i>', 'woo-product-table' ), WPT_CAPABILITY, 'https://wooproducttable.com/pricing/' );
        }
        add_submenu_page( $this->main_slug, esc_html__( 'Browse Plugins', 'woo-product-table' ),  __( 'Browse Plugins', 'woo-product-table' ), WPT_CAPABILITY, 'wpt-browse-plugins', 'wpt_browse_all_plugin_list' );
        add_submenu_page( $this->main_slug, esc_html__( 'ISSUE SUBMIT', 'woo-product-table' ),  __( 'ISSUE SUBMIT', 'woo-product-table' ), WPT_CAPABILITY, 'https://github.com/codersaiful/woo-product-table/issues/new' );
    }

    public function admin_enqueue_scripts()
    {
        global $current_screen;

        $s_id = isset( $current_screen->id ) ? $current_screen->id : '';
        if( strpos( $s_id, $this->plugin_prefix ) === false ) return;

        add_filter('admin_footer_text',[$this, 'admin_footer_text']);




        wp_register_style( $this->plugin_prefix . '-new-admin', $this->base_url . 'assets/css/new-admin.css', false, $this->dev_version );
        wp_enqueue_style( $this->plugin_prefix . '-new-admin' );
    }

    public function admin_footer_text($text)
    {
        $rev_link = 'https://wordpress.org/support/plugin/woo-product-table/reviews/#new-post';
        $text = sprintf(
			__( 'Thank you for using Woo Product Table. <a href="%s" target="_blank">%sPlease review us</a>.' ),
			$rev_link,
            '<i class="wpt-star-filled"></i><i class="wpt-star-filled"></i><i class="wpt-star-filled"></i><i class="wpt-star-filled"></i><i class="wpt-star-filled"></i>'
		);
        return '<span id="footer-thankyou" class="wcmmq-footer-thankyou">' . $text . '</span>';
    }
}