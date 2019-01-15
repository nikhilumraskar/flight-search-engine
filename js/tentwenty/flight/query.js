jQuery(document).ready(function($) {
    
    var Flight_Data = [];
    
    function empty_string(value){
        if(value === undefined) return true;
        if(!value.trim().length) return true;
        return false;
    }
    
    function set_result_head(param){
        
        var origin = empty_string(param.origin)? '___':param.origin;
        var destination = empty_string(param.destination)? '___':param.destination;
        var departure_date = empty_string(param.departure_date)? '__/__/__':param.departure_date;
        
        $('div.result-bar.search_origin_dest').text(origin + ' > ' + destination);
        $('div.result-bar.search_dep_date').text(departure_date);
        
        $('div.no-result').fadeOut(500);
        $('div.result-bar').delay(500).fadeIn();

        
    }
    
    function get_search_result(query, return_way){
        
        var flight_data = JSON.parse(JSON.stringify( Flight_Data ));
        var result = _.where(flight_data, query);
        
        if(return_way){
            var company_wise_flights = _.groupBy(result, 'airlineCode');
            result = [];
            _.each(company_wise_flights, function(company_flight_arr, company_code){
               _.each(company_flight_arr, function(flight){
                   
                    var return_query = {}
                   
                    return_query.origin = flight.destination;
                    
                    return_query.destination = flight.origin;
                    
                    return_query.airlineCode = company_code;
                   
                    var flight_data = JSON.parse(JSON.stringify( Flight_Data ));
                    var return_flights = _.where(flight_data, return_query);

                    if(return_flights.length){
                        flight.return_way_flag = 1;
                        flight.return_flights = return_flights;
                        result.push(flight);
                    }
                   
               }); 
            });
        }
        
        if(result.length){
            set_result_head(query);
        }
        else{
            $('div.result-bar').fadeOut(500);
            $('div.no-result').delay(500).fadeIn();
        }
        
        return result;
    }
    
    function print_search_result(result_arr){
        
        var search_result_template_html = $("#search-result-template").html();
        var search_result_template = _.template(search_result_template_html);
        
        $('.search-results').html('');
        
        _.each(result_arr, function(obj, index){
            var template = $(search_result_template(obj));
            $('.search-results').append(template);
            template.hide();
            template.delay(index * 200).fadeIn(400);
        });

    }
    
    function toggle_mobile_menu(){
        if($("div.sidebar").css('width') == $("body").css('width'))
            $("div.sidebar").animate({ height: 'toggle' });
    }
    
    $.ajax({
        dataType: "json",
        url: '/js/tentwenty/flight/UI_Assignment_Flight_Data.json',
        beforeSend: function(){
        },
        complete: function(){
            toggle_mobile_menu();
        },
        success: function(data){
            console.log(123);
            Flight_Data = _.each(data, function(obj){
                obj['departure_date'] = new Date(obj['departure']).toLocaleDateString();
                obj['arrival_date'] = new Date(obj['arrival']).toLocaleDateString();
                return obj;
            });
            
            var Search_Results = [];
            Search_Results = get_search_result({
                departure_date : new Date($("#departure_date").val()).toLocaleDateString()
            }, $("#return_way.active").length);

            print_search_result(Search_Results);
            
        }
    });
    
    $('#search_query').click(function(){
        
        var return_way = $("#return_way.active").length;
        
        var origin = $("#origin").val().trim().toUpperCase();
        var destination = $("#destination").val().trim().toUpperCase();
        var departure_date = $("#departure_date").val();
        
        if(
            empty_string(origin) &&
            empty_string(destination) &&
            empty_string(departure_date)
        ) 
            return false;
        
        var query = {};
        
        if(!empty_string(origin)) query.origin = origin;
        if(!empty_string(destination)) query.destination = destination;
        if(!empty_string(departure_date)) query.departure_date = new Date(departure_date).toLocaleDateString();
        
        var Search_Results = [];
        Search_Results = get_search_result(query, return_way);
        
        print_search_result(Search_Results);
        
    });
    
    $("button.navbar-toggle, #search_query").click(function(){
        
        toggle_mobile_menu();
        
    });
    
    $(".form-group.btn-group > button.btn-info").click(function(){
        
        $(".form-group.btn-group > button.btn-info").removeClass('active');
        $(this).addClass('active');
        
    });
    
});

/* -> assumption
 * - return ticket price is always equal to one way ticket price for the a given origin - destination and airline company
 * - return flight shown will be of same company against the one way flight
 * - atleast one parameter to be selected from orgine, destnation, departure date.
 * 
 * -> algo
 * [START]
 * 1. Input from user mandatory : one way/return
 *                  atleast one : orgine, destnation, departure date.
 * 2. if orgine or destnation or departure date data invalid, show validation [STOP]
 * 3. if orgine or destnation non - alphabetic, show validation  [STOP]
 * 4. If 'one way' is selected and data is valid 
 *      4.a search database(JSON file) on given parameter (i.e get one way flights for the selected orgin, destination, departure date. )
 *      4.b fetch data if found and print [STOP]
 * 5. If 'return' is selected and data is valid 
 *      5.a search database on given parameter (i.e get the flights for the selected orgin, destination, departure date and one way )
 *      5.b fetch the flight data if found 
 *      5.c for each flight data search for return path in database from the same airline based on the airlineCode.
 *      5.d fetch only those flights where return path is available and print[STOP] 
 * */