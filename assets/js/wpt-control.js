jQuery(function($) {
    'use strict';
    $(document).ready(function() {
        var 
        own_fragment_load = 0,
        wc_fragment_load = 0,
        fragment_handle_load = 0,
        isMob,isDesk,current_width = $(window).width(),
        plugin_url = WPT_DATA.plugin_url,
        include_url = WPT_DATA.include_url,
        content_url = WPT_DATA.content_url,
        ajax_url = WPT_DATA.ajax_url,
        site_url = WPT_DATA.site_url;

        
        //Search Box related code all start here
        var ajaxTableLoad = function(table_id,args,others){
            
            var thisTable = $('#table_id_' + table_id);
            var TableTagWrap = $('#table_id_' + table_id + ' .wpt_table_tag_wrapper');
            var SearchWrap = $('#table_id_' + table_id + ' .wpt-search-full-wrapper');
            if( thisTable.length < 1 ){
                console.log("Error on: ajaxTableLoad. Table not founded!");
                return;
            }
            
            var data = {
                action: 'wpt_load_both',
                table_id: table_id,
                others: others,
                args: args,
            };
            
            TableTagWrap.addClass('wpt-ajax-loading'); //.wpt-wrap.wpt-ajax-loading
            SearchWrap.addClass('wpt-ajax-loading'); //.wpt-wrap.wpt-ajax-loading
            $.ajax({
                type: 'POST',
                url: ajax_url,
                data: data,
                success:function(result){
                    // $('.wpt_edit_table').html(result);
                    if ( result ) {
                        $.each( result, function( key, value ) {
                            if('string' === typeof key){
                                let selectedElement = $('#table_id_' + table_id + ' ' + key);
                                if(typeof selectedElement === 'object'){
                                    selectedElement.html( value );
                                }
                            }
                        });
                    }
                    $(document.body).trigger('wc_fragments_refreshed');
                    TableTagWrap.removeClass('wpt-ajax-loading');
                    SearchWrap.removeClass('wpt-ajax-loading');

                },
                complete:function(){
                    TableTagWrap.removeClass('wpt-ajax-loading');
                    SearchWrap.removeClass('wpt-ajax-loading');
                },
                error:function(){
                    TableTagWrap.removeClass('wpt-ajax-loading');
                    SearchWrap.removeClass('wpt-ajax-loading');
                    console.log("Error on: ajaxTableLoad. Error on Ajax load!");
                }
            });
        };

        $(document.body).on('click','.wpt_pagination_ajax .wpt_my_pagination a',function(e){
            e.preventDefault();
            var thisButton = $(this);
            var thisPagination = thisButton.closest('.wpt_my_pagination');
            var page_number = $(thisButton).text();
            var others = {
                page_number: page_number,
                isMob: isMob,
            };
            
            var table_id = thisPagination.data('table_id');
            var args = getSearchQueriedArgs( table_id );
            
            ajaxTableLoad(table_id, args, others );
            
        });

        $(document.body).on('click','.wpt-search-products',function(){
            
            let table_id = $(this).data('table_id');
            var args = getSearchQueriedArgs( table_id );
            
            var page_number = 1;
            var others = {
                page_number: page_number,
                isMob: isMob,
            };
            ajaxTableLoad(table_id, args, others );
            
        });

        function getSearchQueriedArgs( table_id ){
            let value,key,base_link;

            //On ajax search, Page link shown with ajax link, we will send this base link, so that always can get smart link
            base_link = $('.wpt-my-pagination-'  + table_id ).data('base_link');
            var texonomies = {};
            value = false;
            $('#search_box_' + table_id + ' .search_select.query').each(function(){
                
                key = $(this).data('key');
                value = $(this).val();
                if(value != ""){
                    texonomies[key] = value;
                }
            });

            var tax_query = {};
            Object.keys(texonomies).forEach(function(aaa,bbb){
                var key = aaa + '_IN';
                if(texonomies[aaa] !== null && Object.keys(texonomies[aaa]).length > 0){
                    tax_query[key] = {
                        taxonomy: aaa,
                        field:  'id',  
                        terms:  texonomies[aaa],
                        operator:   'IN'
                    };
                }
            });

            var custom_field = {},meta_query  = {}, multiple_attr = {};

            $('#search_box_' + table_id + ' .search_select.cf_query').each(function(){
                var attr = $(this).attr('multiple');
                
                key = $(this).data('key');
                value = $(this).val();
                if(value != ""){
                    custom_field[key] = value;
                    multiple_attr[key] = attr;
                }
            });
            Object.keys(custom_field).forEach(function(key,bbb){
                 if(Object.keys(custom_field[key]).length > 0){ //custom_field[key] !== null && 
                    var compare = multiple_attr[key];
                    
                    if(! compare){
                        meta_query[key] = {
                                    key: key,  
                                    value:  custom_field[key],
                                    compare: 'LIKE'
                            };   
                    }else{
                        meta_query[key] = {
                                    key: key,  
                                    value:  custom_field[key]
                            }; 
                    }
                } 
            });
            

            var s= $('#search_box_' + table_id + ' .search_single_direct .query-keyword-input-box').val();
            var orderby= $('#search_box_' + table_id + ' .search_single_order_by select').val();
            var on_sale= $('#search_box_' + table_id + ' .search_single_order select').val();
            
            
            var args = {
                s: s,
                tax_query: tax_query,
                orderby: orderby,
                on_sale: on_sale,
                meta_query: meta_query,
                base_link:base_link,
            };
            return args;
        }


        $(document.body).on('click','.wpt-query-reset-button',function(){
            $(this).closest('.wpt-search-full-wrapper').find('.query_box_direct_value').val('');
            $(this).closest('.wpt-search-full-wrapper').find('select').val('').change();
            $(this).closest('.wpt-search-full-wrapper').find('.wpt-search-products').trigger('click');
        });

        $(document).on('wc_fragments_refreshed',function(){
            fragment_load();
        });
        $(document).on('wc_fragments_refresh',function(){
            fragment_load();
        });
        
        $(document).on('wc_fragment_refresh',function(){
            fragment_load();
        });
        
        $(document).on('removed_from_cart',function(){
            fragment_load();
        });
        
        /**
         * Our custom fragment event,
         * if trigger, it will call
         */
        $(document).on('wpt_fragment_load',function(){
            fragment_load();
        });

        // fragment_load();
        function fragment_load(){
            
            
            //Control own fragment load for the first time only
            if(own_fragment_load > 0) return;
            setInterval(function(){
                own_fragment_load = 0;
            },1000);
            own_fragment_load++;
            let data = {
                action: 'wpt_wc_fragments'
            };
            $.ajax({
                type: 'POST',
                url: ajax_url,
                data: data,
                success:wc_fragment_handle
            });
        }
        function wc_fragment_handle( ownFragment ){
            
            
            if(typeof ownFragment  !== 'object') return;

            try{
                ownFragmentPerItemsHandle( ownFragment );
            }catch(e){
                console.log('Something went wrong on ownFragment loads.',ownFragment);
            }

        }
        function ownFragmentPerItemsHandle(ownFragment){
            
            let cart_item_key,quantity;

            var perItems = ownFragment.per_items;

            $('.wpt_row').each(function(){
                var thisRow = $(this);
                var product_id = thisRow.data('product_id');
                if(perItems[product_id] !== undefined){
                    //class added to row
                    thisRow.addClass('wpt-added-to-cart');

                    var item = perItems[product_id];
                    quantity = item.quantity;
                    cart_item_key = item.cart_item_key;
                    var Bubble = thisRow.find('.wpt_ccount');
                    if(Bubble.length == 0){
                        thisRow.find('a.add_to_cart_button').append('<span class="wpt_ccount wpt_ccount_' + product_id + '">' + quantity + '</span>');
                    }else{
                        Bubble.html(quantity);
                    }
                    var crossButton = thisRow.find('.wpt-cart-remove');
                    if(crossButton.length == 0){
                        thisRow.find('a.add_to_cart_button').after('<span data-cart_item_key="' + cart_item_key + '" data-product_id="' + product_id + '" class="wpt-cart-remove wpt-cart-remove-' + product_id + '"></span>');
                    }
                    
                }else{
                    thisRow.removeClass('wpt-added-to-cart');
                    thisRow.find('.wpt_ccount').remove();
                    thisRow.find('.wpt-cart-remove').remove();
                }
                
                
            });
        }
        
        /**
         * footer cart animation
         * Cart icon spining on footer mini cart 
         * and blur effect on footer cart
         */
        function footerCartAnimation(){
            $('a.wpt-view-n .wpt-bag').addClass('wpt-spin4 animate-spin');
            $('.wpt-new-footer-cart').addClass('wpt-fcart-anim');
            $('.wpt-fcart-coll-expand').addClass('animated');            
        }
        //Search box related code end here
        $(document.body).on( 'click','.wpt-cart-remove',function(){
            $(this).parent('li').fadeOut();
            footerCartAnimation();
            $(this).addClass('wpt_spin');
            let product_id = $(this).data('product_id');
            let cart_item_key = $(this).attr('data-cart_item_key');
            var data = {
                action: 'wpt_remove_from_cart',
                product_id: product_id,
                cart_item_key: cart_item_key,
            };
            $.ajax({
                type: 'POST',
                url: ajax_url,
                data: data,
                success:function(result){
                    
                    if(result == 'removed'){
                        
                    }
                    $('.wpt-cart-remove.wpt-cart-remove-' + product_id).remove();
                    $('#product_id_' + product_id + ' a.added_to_cart.wc-forward').remove();

                    $( document.body ).trigger( 'removed_from_cart' );
                    $( document.body ).trigger( 'added_to_cart' );
                    $( document.body ).trigger( 'updated_cart_totals' );
                    $( document.body ).trigger( 'wc_fragments_refreshed' );
                    $( document.body ).trigger( 'wc_fragments_refresh' );
                    $( document.body ).trigger( 'wc_fragment_refresh' );

                },
                
            });

        });

        
        
        if(current_width <= 500){
            isMob = true;
            isDesk = false;
            genDestToMobTable();
        }else{
            isMob = false;
            isDesk = true;
        }

        $(window).on('resize', deviceWiseResize);
        function deviceWiseResize(){
            
            current_width = $(window).width();

            if(!isMob && current_width <= 500){
                isMob = true;
                isDesk = false;
                // console.log('isDesk',isDesk);
                // console.log('isMobi',isMob);
                // console.log("Called Mobile");

                genDestToMobTable();
            }

            if(!isDesk && current_width > 500){
                isMob = false;
                isDesk = true;
                // console.log("Called Desktop");
                genMobToDeskTable();
            }
        }
        function genDestToMobTable(){
            
            var Table = $('.wpt-auto-responsive .wpt-tbl');
            // Table.css({display:'none'});
            Table.find('thead').hide();

            var TableBody = Table.find('tbody');
            TableBody.find('tr').each(function(){
                var TableRow = $(this);
                var alreadyGen = TableRow.find('.wpt-replace-td-in-tr').length;
                if(alreadyGen > 0) return;
                var RowData = TableRow.html();
                var reslt = RowData.replaceAll('<td class="td_or_cell','<div class="td_or_cell');
                    reslt = reslt.replaceAll('</td><!--EndTd-->','</div><!--EndTd-->');
                reslt = "<td class='wpt-replace-td-in-tr'>" + reslt + "</td>";
                TableRow.html(reslt);
                // console.log(reslt);

                // console.log(TableRow[0].attributes);
            });
        }
        function genMobToDeskTable(){
            var Table = $('.wpt-auto-responsive .wpt-tbl');
            Table.find('thead').fadeIn();
            var TableBody = Table.find('tbody');
            TableBody.find('tr').each(function(){
                var TableRow = $(this);
                var RowData = TableRow.find('td.wpt-replace-td-in-tr').html();
                var reslt = RowData.replaceAll('<div class="td_or_cell','<td class="td_or_cell');
                    reslt = reslt.replaceAll('</div><!--EndTd-->','</td><!--EndTd-->');
                TableRow.html(reslt);
                // console.log(reslt);

                // console.log(TableRow[0].attributes);
            });
            
        }


        /**
         * Footer Mini cart New Version
         * 
         * Adding a new div to at the bottom of body
         * <div class="wpt-new-footer-cart">
         * 
         * has adding here.
         * @since 3.2.5.2
         */
        $(document.body).append('<div class="wpt-new-footer-cart"></div>');

        
        $(document.body).on('click','.wpt-fcart-coll-expand,.wpt-cart-contents span.count',function(){
            
            $('body').toggleClass('wpt-footer-cart-expand');
            if($('body').hasClass('wpt-footer-cart-expand')){
                $('.wpt-lister').fadeIn('slow');
            }else{
                $('.wpt-lister').fadeOut('slow');
            }

        });


    });
});
