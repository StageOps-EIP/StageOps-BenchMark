package main

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type Event struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Date     string `json:"date"`
	Capacity int    `json:"capacity"`
	Booked   int    `json:"booked"`
}

type Response struct {
	Success bool        `json:"success"`
	Count   *int        `json:"count,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type HealthResponse struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	Timestamp string `json:"timestamp"`
}

var users = []User{
	{ID: 1, Name: "Alice", Email: "alice@theatre.com"},
	{ID: 2, Name: "Bob", Email: "bob@theatre.com"},
	{ID: 3, Name: "Charlie", Email: "charlie@theatre.com"},
}

var events = []Event{
	{ID: 1, Title: "Le Cid", Date: "2026-03-15", Capacity: 500, Booked: 342},
	{ID: 2, Title: "Hamlet", Date: "2026-04-20", Capacity: 800, Booked: 756},
	{ID: 3, Title: "Macbeth", Date: "2026-05-10", Capacity: 600, Booked: 423},
}

func main() {
	app := fiber.New(fiber.Config{
		DisableStartupMessage: false,
	})

	// Health endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(HealthResponse{
			Status:    "ok",
			Service:   "fiber",
			Timestamp: time.Now().Format(time.RFC3339),
		})
	})

	// Users endpoints
	app.Get("/users", func(c *fiber.Ctx) error {
		count := len(users)
		return c.JSON(Response{
			Success: true,
			Count:   &count,
			Data:    users,
		})
	})

	app.Get("/users/:id", func(c *fiber.Ctx) error {
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			return c.Status(400).JSON(Response{
				Success: false,
				Error:   "Invalid user ID",
			})
		}

		for _, user := range users {
			if user.ID == id {
				return c.JSON(Response{
					Success: true,
					Data:    user,
				})
			}
		}

		return c.Status(404).JSON(Response{
			Success: false,
			Error:   "User not found",
		})
	})

	app.Post("/users", func(c *fiber.Ctx) error {
		var newUser User
		if err := c.BodyParser(&newUser); err != nil {
			return c.Status(400).JSON(Response{
				Success: false,
				Error:   "Invalid request body",
			})
		}

		if newUser.Name == "" || newUser.Email == "" {
			return c.Status(400).JSON(Response{
				Success: false,
				Error:   "Name and email required",
			})
		}

		newUser.ID = len(users) + 1
		users = append(users, newUser)

		return c.Status(201).JSON(Response{
			Success: true,
			Data:    newUser,
		})
	})

	// Events endpoints
	app.Get("/events", func(c *fiber.Ctx) error {
		count := len(events)
		return c.JSON(Response{
			Success: true,
			Count:   &count,
			Data:    events,
		})
	})

	app.Get("/events/:id", func(c *fiber.Ctx) error {
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			return c.Status(400).JSON(Response{
				Success: false,
				Error:   "Invalid event ID",
			})
		}

		for _, event := range events {
			if event.ID == id {
				return c.JSON(Response{
					Success: true,
					Data:    event,
				})
			}
		}

		return c.Status(404).JSON(Response{
			Success: false,
			Error:   "Event not found",
		})
	})

	app.Post("/events", func(c *fiber.Ctx) error {
		var newEvent Event
		if err := c.BodyParser(&newEvent); err != nil {
			return c.Status(400).JSON(Response{
				Success: false,
				Error:   "Invalid request body",
			})
		}

		if newEvent.Title == "" || newEvent.Date == "" || newEvent.Capacity == 0 {
			return c.Status(400).JSON(Response{
				Success: false,
				Error:   "Title, date and capacity required",
			})
		}

		newEvent.ID = len(events) + 1
		newEvent.Booked = 0
		events = append(events, newEvent)

		return c.Status(201).JSON(Response{
			Success: true,
			Data:    newEvent,
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Fiber server running on port %s\n", port)
	log.Fatal(app.Listen(":" + port))
}
