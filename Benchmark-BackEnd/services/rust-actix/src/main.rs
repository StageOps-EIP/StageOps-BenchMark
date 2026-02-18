use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::env;
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct User {
    id: i32,
    name: String,
    email: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Event {
    id: i32,
    title: String,
    date: String,
    capacity: i32,
    booked: i32,
}

#[derive(Serialize)]
struct Response<T> {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    count: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    timestamp: String,
}

struct AppState {
    users: Mutex<Vec<User>>,
    events: Mutex<Vec<Event>>,
}

async fn health() -> impl Responder {
    HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_string(),
        service: "actix".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

async fn get_users(data: web::Data<AppState>) -> impl Responder {
    let users = data.users.lock().unwrap();
    HttpResponse::Ok().json(Response {
        success: true,
        count: Some(users.len()),
        data: Some(users.clone()),
        error: None,
    })
}

async fn get_user(data: web::Data<AppState>, path: web::Path<i32>) -> impl Responder {
    let users = data.users.lock().unwrap();
    let id = path.into_inner();
    
    if let Some(user) = users.iter().find(|u| u.id == id) {
        HttpResponse::Ok().json(Response {
            success: true,
            count: None,
            data: Some(user.clone()),
            error: None,
        })
    } else {
        HttpResponse::NotFound().json(Response::<User> {
            success: false,
            count: None,
            data: None,
            error: Some("User not found".to_string()),
        })
    }
}

#[derive(Deserialize)]
struct CreateUser {
    name: String,
    email: String,
}

async fn create_user(data: web::Data<AppState>, user_data: web::Json<CreateUser>) -> impl Responder {
    let mut users = data.users.lock().unwrap();
    let new_id = users.len() as i32 + 1;
    
    let new_user = User {
        id: new_id,
        name: user_data.name.clone(),
        email: user_data.email.clone(),
    };
    
    users.push(new_user.clone());
    
    HttpResponse::Created().json(Response {
        success: true,
        count: None,
        data: Some(new_user),
        error: None,
    })
}

async fn get_events(data: web::Data<AppState>) -> impl Responder {
    let events = data.events.lock().unwrap();
    HttpResponse::Ok().json(Response {
        success: true,
        count: Some(events.len()),
        data: Some(events.clone()),
        error: None,
    })
}

async fn get_event(data: web::Data<AppState>, path: web::Path<i32>) -> impl Responder {
    let events = data.events.lock().unwrap();
    let id = path.into_inner();
    
    if let Some(event) = events.iter().find(|e| e.id == id) {
        HttpResponse::Ok().json(Response {
            success: true,
            count: None,
            data: Some(event.clone()),
            error: None,
        })
    } else {
        HttpResponse::NotFound().json(Response::<Event> {
            success: false,
            count: None,
            data: None,
            error: Some("Event not found".to_string()),
        })
    }
}

#[derive(Deserialize)]
struct CreateEvent {
    title: String,
    date: String,
    capacity: i32,
}

async fn create_event(data: web::Data<AppState>, event_data: web::Json<CreateEvent>) -> impl Responder {
    let mut events = data.events.lock().unwrap();
    let new_id = events.len() as i32 + 1;
    
    let new_event = Event {
        id: new_id,
        title: event_data.title.clone(),
        date: event_data.date.clone(),
        capacity: event_data.capacity,
        booked: 0,
    };
    
    events.push(new_event.clone());
    
    HttpResponse::Created().json(Response {
        success: true,
        count: None,
        data: Some(new_event),
        error: None,
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let bind_addr = format!("0.0.0.0:{}", port);
    
    let app_state = web::Data::new(AppState {
        users: Mutex::new(vec![
            User {
                id: 1,
                name: "Alice".to_string(),
                email: "alice@theatre.com".to_string(),
            },
            User {
                id: 2,
                name: "Bob".to_string(),
                email: "bob@theatre.com".to_string(),
            },
            User {
                id: 3,
                name: "Charlie".to_string(),
                email: "charlie@theatre.com".to_string(),
            },
        ]),
        events: Mutex::new(vec![
            Event {
                id: 1,
                title: "Le Cid".to_string(),
                date: "2026-03-15".to_string(),
                capacity: 500,
                booked: 342,
            },
            Event {
                id: 2,
                title: "Hamlet".to_string(),
                date: "2026-04-20".to_string(),
                capacity: 800,
                booked: 756,
            },
            Event {
                id: 3,
                title: "Macbeth".to_string(),
                date: "2026-05-10".to_string(),
                capacity: 600,
                booked: 423,
            },
        ]),
    });
    
    println!("Actix server running on port {}", port);
    
    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .route("/health", web::get().to(health))
            .route("/users", web::get().to(get_users))
            .route("/users/{id}", web::get().to(get_user))
            .route("/users", web::post().to(create_user))
            .route("/events", web::get().to(get_events))
            .route("/events/{id}", web::get().to(get_event))
            .route("/events", web::post().to(create_event))
    })
    .bind(&bind_addr)?
    .run()
    .await
}
