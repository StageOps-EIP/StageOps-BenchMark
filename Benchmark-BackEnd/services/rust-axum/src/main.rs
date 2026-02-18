use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::env;
use std::sync::{Arc, Mutex};

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

#[derive(Clone)]
struct AppState {
    users: Arc<Mutex<Vec<User>>>,
    events: Arc<Mutex<Vec<Event>>>,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        service: "axum".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

async fn get_users(State(state): State<AppState>) -> Json<Response<Vec<User>>> {
    let users = state.users.lock().unwrap();
    Json(Response {
        success: true,
        count: Some(users.len()),
        data: Some(users.clone()),
        error: None,
    })
}

async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> impl IntoResponse {
    let users = state.users.lock().unwrap();
    
    if let Some(user) = users.iter().find(|u| u.id == id) {
        (
            StatusCode::OK,
            Json(Response {
                success: true,
                count: None,
                data: Some(user.clone()),
                error: None,
            }),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(Response::<User> {
                success: false,
                count: None,
                data: None,
                error: Some("User not found".to_string()),
            }),
        )
    }
}

#[derive(Deserialize)]
struct CreateUser {
    name: String,
    email: String,
}

async fn create_user(
    State(state): State<AppState>,
    Json(user_data): Json<CreateUser>,
) -> impl IntoResponse {
    let mut users = state.users.lock().unwrap();
    let new_id = users.len() as i32 + 1;
    
    let new_user = User {
        id: new_id,
        name: user_data.name,
        email: user_data.email,
    };
    
    users.push(new_user.clone());
    
    (
        StatusCode::CREATED,
        Json(Response {
            success: true,
            count: None,
            data: Some(new_user),
            error: None,
        }),
    )
}

async fn get_events(State(state): State<AppState>) -> Json<Response<Vec<Event>>> {
    let events = state.events.lock().unwrap();
    Json(Response {
        success: true,
        count: Some(events.len()),
        data: Some(events.clone()),
        error: None,
    })
}

async fn get_event(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> impl IntoResponse {
    let events = state.events.lock().unwrap();
    
    if let Some(event) = events.iter().find(|e| e.id == id) {
        (
            StatusCode::OK,
            Json(Response {
                success: true,
                count: None,
                data: Some(event.clone()),
                error: None,
            }),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(Response::<Event> {
                success: false,
                count: None,
                data: None,
                error: Some("Event not found".to_string()),
            }),
        )
    }
}

#[derive(Deserialize)]
struct CreateEvent {
    title: String,
    date: String,
    capacity: i32,
}

async fn create_event(
    State(state): State<AppState>,
    Json(event_data): Json<CreateEvent>,
) -> impl IntoResponse {
    let mut events = state.events.lock().unwrap();
    let new_id = events.len() as i32 + 1;
    
    let new_event = Event {
        id: new_id,
        title: event_data.title,
        date: event_data.date,
        capacity: event_data.capacity,
        booked: 0,
    };
    
    events.push(new_event.clone());
    
    (
        StatusCode::CREATED,
        Json(Response {
            success: true,
            count: None,
            data: Some(new_event),
            error: None,
        }),
    )
}

#[tokio::main]
async fn main() {
    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let bind_addr = format!("0.0.0.0:{}", port);
    
    let app_state = AppState {
        users: Arc::new(Mutex::new(vec![
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
        ])),
        events: Arc::new(Mutex::new(vec![
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
        ])),
    };
    
    let app = Router::new()
        .route("/health", get(health))
        .route("/users", get(get_users).post(create_user))
        .route("/users/:id", get(get_user))
        .route("/events", get(get_events).post(create_event))
        .route("/events/:id", get(get_event))
        .with_state(app_state);
    
    println!("Axum server running on port {}", port);
    
    let listener = tokio::net::TcpListener::bind(&bind_addr)
        .await
        .unwrap();
    
    axum::serve(listener, app).await.unwrap();
}
