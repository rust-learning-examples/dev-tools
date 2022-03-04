use std::process::Command;
pub fn exec_text(text: String, password: String) -> Result<String, String> {
    let mut total_output = String::new();
    let command_pieces = text.split("\n").collect::<Vec<&str>>();

    for piece in command_pieces.iter() {
        let command_piece = piece.trim();
        if command_piece.is_empty() || command_piece.starts_with("#") {
            continue;
        }

        let output = if cfg!(target_os = "windows") {
            Command::new("cmd")
                .args(["/C", command_piece])
                .output()
        } else {
            let command_item = if command_piece.starts_with("sudo") { command_piece.replace("sudo", &format!(r#"sudo -S -k <<< '{}'"#, password)) } else { command_piece.to_string() };
            Command::new("sh")
                .arg("-c")
                .arg(&command_item)
                .output()
        };
        match output {
            Ok(data) => {
                let stdout = std::str::from_utf8(&data.stdout).unwrap_or("");
                let stderr = std::str::from_utf8(&data.stderr).unwrap_or("");
                if data.status.success() {
                    total_output.push_str(&format!(r#"<span style="color: #888">$ {}</span><br/>Output: {:?}<br/><br/>"#, command_piece, stdout));
                } else {
                    total_output.push_str(&format!(r#"<span style="color: #888">$ {}</span><br/>Error: {:?}<br/><br/>"#, command_piece, stderr));
                    return Err(total_output)
                }
            },
            Err(e) => {
                total_output.push_str(&format!(r#"<span style="color: #888">$ {}</span><br/>Error: {:?}<br/><br/>"#, command_piece, e));
                return Err(total_output)
            }
        };
    }
    Ok(total_output)
}